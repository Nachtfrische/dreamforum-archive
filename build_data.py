#!/usr/bin/env python3
"""Export the public DreamForum archive as static, GitHub Pages-ready JSON."""

from __future__ import annotations

import argparse
import html
import json
import re
import sqlite3
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path


EXCLUDED_BOARD_IDS = {230, 231}


DEFAULT_DB = Path(__file__).parents[1] / "dreamforum-reader" / "dreamforum_cache.sqlite3"
DEFAULT_SITE = Path(__file__).with_name("site")
ALLOWED_TAGS = {
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "code",
    "pre",
    "h2",
    "h3",
}
BLOCKED_TAGS = {"script", "style", "iframe", "object", "embed", "svg", "math"}
EMOTICONS = {
    ":)": "🙂", ":-)": "🙂", ":d": "😄", ":-d": "😄", ":d*": "😄",
    ":p": "😛", ":-p": "😛", ":(": "🙁", ":-(": "🙁", ":,(": "😢", ":'(": "😢", ":/": "😕",
    ":s": "😬", ":|": "😐", ":*": "😘", ":-*": "😘", "kappa": "😏",
    "thumbsup": "👍", "thumbup": "👍", "thumbdown": "👎", "love": "❤️",
    "saint": "😇", "rolleyes": "🙄", "whistling": "😗", "cursing": "🤬",
    "huh": "🤨", "pinch": "😣", "facepalm": "🤦", "sleeping": "😴",
    "thinking": "🤔", "thinkinghard": "🤔", "evil": "😈", "tear": "😢",
    "rote-backen": "😊", "ehgrin": "😁", ":o": "😮",
    "!": "❗", "?": "❓",
}


def emoticon_for(value):
    key = value.strip().lower()
    if key.startswith("[:") and key.endswith("]"):
        key = key[2:-1]
    return EMOTICONS.get(key) or EMOTICONS.get(key.rstrip(":")) or EMOTICONS.get(key.strip(":"))


def replace_emoticons(value):
    def replacement(match):
        emoji = emoticon_for(match.group(1))
        return emoji or match.group(0)

    return re.sub(r"\[:([^\]\s]{1,30})\]", replacement, value)


class PostSanitizer(HTMLParser):
    """Keep useful post structure while dropping active and remote content."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.stack: list[str] = []
        self.quote_content: list[bool] = []
        self.blocked_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attrs = {name.lower(): value or "" for name, value in attrs}
        if tag in BLOCKED_TAGS:
            self.blocked_depth += 1
            return
        if self.blocked_depth:
            return
        if tag == "woltlab-spoiler":
            self.parts.append("<details><summary>Spoiler</summary>")
            self.stack.append("details")
        elif tag == "woltlab-quote":
            if self.quote_content:
                self.quote_content[-1] = True
            author = html.unescape(attrs.get("data-author", "")).strip()
            self.parts.append('<blockquote class="archive-quote"><cite>')
            self.parts.append("Zitat von <strong>%s</strong>" % html.escape(author) if author else "Zitat")
            self.parts.append("</cite>")
            self.stack.append("blockquote")
            self.quote_content.append(False)
        elif tag == "woltlab-metacode":
            name = attrs.get("data-name", "").lower()
            if name == "user":
                self.parts.append('<span class="mention">@')
                self.stack.append("span")
            elif name in {"s", "i", "sup", "sub"}:
                self.parts.append("<%s>" % name)
                self.stack.append(name)
            elif name == "align":
                self.parts.append('<div class="message-align">')
                self.stack.append("div")
            else:
                self.parts.append('<span class="metacode-inline">')
                self.stack.append("span")
        elif tag == "a":
            href = attrs.get("href", "")
            if href.startswith(("http://", "https://")):
                self.parts.append(
                    '<a href="%s" target="_blank" rel="nofollow noopener noreferrer">'
                    % html.escape(href, quote=True)
                )
                self.stack.append("a")
            else:
                self.stack.append("")
        elif tag == "img":
            if self.quote_content:
                self.quote_content[-1] = True
            alt = attrs.get("alt", "")
            emoji = emoticon_for(alt)
            if emoji:
                self.parts.append('<span class="archive-emoji">%s</span>' % html.escape(emoji))
            else:
                self.parts.append('<span class="missing-media">[%s]</span>' % html.escape(alt or "Bild"))
        elif tag in ALLOWED_TAGS:
            self.parts.append("<%s>" % tag)
            if tag != "br":
                self.stack.append(tag)
        else:
            self.stack.append("")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in BLOCKED_TAGS:
            self.blocked_depth = max(0, self.blocked_depth - 1)
            return
        if self.blocked_depth or not self.stack:
            return
        if tag == "woltlab-quote" and self.quote_content and not self.quote_content.pop():
            self.parts.append('<span class="quote-missing">Zitierter Inhalt ist im Dump nicht eingebettet.</span>')
        close = self.stack.pop()
        if close:
            self.parts.append("</%s>" % close)

    def handle_data(self, data):
        if not self.blocked_depth:
            if self.quote_content and data.strip():
                self.quote_content[-1] = True
            self.parts.append(html.escape(replace_emoticons(data)))

    def finish(self):
        while self.stack:
            close = self.stack.pop()
            if close:
                self.parts.append("</%s>" % close)
        value = "".join(self.parts)
        value = re.sub(r"(?:<br>\s*){4,}", "<br><br>", value, flags=re.I)
        value = re.sub(r"<p>\s*</p>", "", value, flags=re.I)
        return value.strip()


class PlainText(HTMLParser):
    BLOCKS = {"p", "div", "li", "blockquote", "br", "h1", "h2", "h3", "details", "summary"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in self.BLOCKS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.BLOCKS:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)


def sanitize(value):
    parser = PostSanitizer()
    parser.feed(value or "")
    parser.close()
    return parser.finish()


def plain(value):
    parser = PlainText()
    parser.feed(sanitize(value))
    parser.close()
    text = "".join(parser.parts)
    text = re.sub(r"\[/?(?:b|i|u|s|quote|code|url|img)(?:=[^\]]+)?\]", "", text, flags=re.I)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{3,}", "\n\n", text)).strip()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def localized(db, value, fallback=""):
    if not value or "." not in str(value):
        return value or fallback
    row = db.execute(
        """SELECT CASE WHEN languageUseCustomValue=1 AND languageCustomItemValue IS NOT NULL
           THEN languageCustomItemValue ELSE languageItemValue END
           FROM wcf1_language_item WHERE languageItem=?
           ORDER BY languageID=1 DESC, languageID LIMIT 1""",
        (value,),
    ).fetchone()
    return row[0] if row and row[0] else fallback


def team_roles(db):
    row = db.execute("SELECT value FROM _meta WHERE key='dump_path'").fetchone()
    dump = Path(row[0]) if row else None
    if not dump or not dump.is_dir():
        raise FileNotFoundError("SQL-Dump für Teamrollen nicht gefunden: %s" % dump)
    sys.path.insert(0, str(DEFAULT_DB.parent))
    from dreamforum_reader import import_table, source_file

    roles_db = sqlite3.connect(":memory:")
    import_table(roles_db, source_file(dump, "wcf1_user_group"), "groups", {
        "groupID", "groupName", "priority", "userOnlineMarking", "showOnTeamPage",
    })
    import_table(roles_db, source_file(dump, "wcf1_user_to_group"), "memberships", {"userID", "groupID"})
    roles = {}
    for user_id, group_id, name, priority, marking in roles_db.execute(
        """SELECT m.userID,g.groupID,g.groupName,g.priority,g.userOnlineMarking
           FROM memberships m JOIN groups g USING(groupID)
           WHERE g.showOnTeamPage=1 ORDER BY g.priority DESC,g.groupID"""
    ):
        match = re.search(r"color:\s*(#[0-9a-f]{3,8}|[a-z]+)", marking or "", re.I)
        if user_id not in roles and match:
            roles[user_id] = {"groupID": group_id, "name": name, "priority": priority, "color": match.group(1)}
    roles_db.close()
    return roles


def post_editors(db):
    row = db.execute("SELECT value FROM _meta WHERE key='dump_path'").fetchone()
    dump = Path(row[0]) if row else None
    if not dump or not dump.is_dir():
        raise FileNotFoundError("SQL-Dump für Beitragsbearbeitungen nicht gefunden: %s" % dump)
    sys.path.insert(0, str(DEFAULT_DB.parent))
    from dreamforum_reader import import_table, source_file

    edits_db = sqlite3.connect(":memory:")
    import_table(edits_db, source_file(dump, "wbb1_post"), "post_edits", {
        "postID", "editorID", "editor",
    })
    edits = {
        post_id: {"editorID": editor_id, "editor": editor or ""}
        for post_id, editor_id, editor in edits_db.execute(
            "SELECT postID,editorID,editor FROM post_edits WHERE editorID IS NOT NULL OR editor<>''"
        )
    }
    edits_db.close()
    return edits


def build(db_path, site):
    if not db_path.is_file():
        raise FileNotFoundError("Lesecache nicht gefunden: %s" % db_path)
    data_dir = site / "data"
    thread_dir = data_dir / "threads"
    user_dir = data_dir / "users"
    thread_dir.mkdir(parents=True, exist_ok=True)
    user_dir.mkdir(parents=True, exist_ok=True)
    for generated in (*thread_dir.glob("*.json"), *user_dir.glob("*.json")):
        generated.unlink()

    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    try:
        roles = team_roles(db)
        editors = post_editors(db)
        boards = []
        for row in db.execute(
            """SELECT boardID,parentID,position,boardType,title,description,isClosed,
                      posts,threads FROM wbb1_board ORDER BY position,boardID"""
        ):
            item = dict(row)
            item["title"] = plain(localized(db, item["title"], "")) or "Archivbereich ohne überlieferten Titel"
            item["description"] = plain(localized(db, item["description"], ""))
            if item["boardID"] not in EXCLUDED_BOARD_IDS:
                boards.append(item)

        threads = [
            dict(row)
            for row in db.execute(
                """SELECT threadID,boardID,topic,time,userID,username,lastPostTime,lastPoster,
                          replies,views,attachments,isSticky,isClosed,cumulativeLikes
                   FROM wbb1_thread WHERE isDeleted=0 AND boardID NOT IN (230,231)
                   ORDER BY lastPostTime DESC,threadID DESC"""
            )
        ]

        users = []
        for row in db.execute(
            """SELECT userID,username,registrationDate,userTitle,lastActivityTime,profileHits,
                      activityPoints,likesReceived,wbbPosts,signature
               FROM wcf1_user ORDER BY username COLLATE NOCASE,userID"""
        ):
            item = dict(row)
            item["signatureHtml"] = sanitize(item.pop("signature") or "")
            item["teamRole"] = roles.get(item["userID"])
            users.append(item)

        attachments_by_post = defaultdict(list)
        for row in db.execute(
            """SELECT attachmentID,objectID,filename,filesize,fileType,isImage,width,height,
                      downloads,uploadTime FROM wcf1_attachment WHERE objectTypeID=224
               ORDER BY objectID,attachmentID"""
        ):
            attachments_by_post[row["objectID"]].append(dict(row))

        poll_options = defaultdict(list)
        for row in db.execute(
            "SELECT optionID,pollID,optionValue,votes,showOrder FROM wcf1_poll_option ORDER BY pollID,showOrder,optionID"
        ):
            item = dict(row)
            item["optionValue"] = plain(item["optionValue"])
            poll_options[item["pollID"]].append(item)
        polls_by_post = defaultdict(list)
        for row in db.execute(
            """SELECT pollID,objectID,question,time,endTime,isPublic,maxVotes,votes
               FROM wcf1_poll WHERE objectTypeID=231 ORDER BY objectID,pollID"""
        ):
            item = dict(row)
            item["question"] = plain(item["question"])
            item["options"] = poll_options[item["pollID"]]
            polls_by_post[item["objectID"]].append(item)

        tags_by_thread = defaultdict(list)
        for row in db.execute(
            """SELECT tto.objectID,t.tagID,t.name FROM wcf1_tag_to_object tto
               JOIN wcf1_tag t USING(tagID) WHERE tto.objectTypeID=225
               ORDER BY tto.objectID,t.name COLLATE NOCASE,t.tagID"""
        ):
            tags_by_thread[row["objectID"]].append({"tagID": row["tagID"], "name": plain(row["name"])})

        likes_by_post = defaultdict(list)
        for row in db.execute(
            """SELECT l.objectID,l.userID,u.username,l.time,l.likeValue
               FROM wcf1_like l LEFT JOIN wcf1_user u USING(userID)
               WHERE l.objectTypeID=211
               ORDER BY l.objectID,l.likeValue DESC,l.time,l.likeID"""
        ):
            likes_by_post[row["objectID"]].append({
                "userID": row["userID"],
                "username": row["username"] or "Unbekannt",
                "time": row["time"],
                "value": row["likeValue"],
            })

        posts_by_thread = defaultdict(list)
        posts_by_user = defaultdict(list)
        search = [
            {
                "kind": "thread",
                "id": item["threadID"],
                "userID": item["userID"],
                "boardID": item["boardID"],
                "author": item["username"],
                "time": item["time"],
                "subject": item["topic"],
                "text": item["topic"],
            }
            for item in threads
        ]
        search.extend(
            {
                "kind": "user",
                "id": item["userID"],
                "userID": item["userID"],
                "author": item["username"],
                "time": item["registrationDate"],
                "subject": item["username"],
                "text": plain(item["signatureHtml"]),
            }
            for item in users
        )
        thread_map = {item["threadID"]: item for item in threads}
        for row in db.execute(
            """SELECT postID,threadID,userID,username,subject,message,time,lastEditTime,
                      editCount,editReason,attachments,cumulativeLikes
               FROM wbb1_post WHERE isDeleted=0 AND isDisabled=0 ORDER BY threadID,time,postID"""
        ):
            item = dict(row)
            if item["threadID"] not in thread_map:
                continue
            item.update(editors.get(item["postID"], {"editorID": None, "editor": ""}))
            item["likes"] = likes_by_post[item["postID"]]
            source = item.pop("message") or ""
            item["bodyHtml"] = sanitize(source)
            item["attachments"] = attachments_by_post[item["postID"]]
            item["polls"] = polls_by_post[item["postID"]]
            body_text = plain(source)
            posts_by_thread[item["threadID"]].append(item)
            if item["userID"]:
                posts_by_user[item["userID"]].append(
                    {
                        "postID": item["postID"],
                        "threadID": item["threadID"],
                        "subject": item["subject"],
                        "time": item["time"],
                        "text": body_text[:280],
                    }
                )
            search.append(
                {
                    "kind": "post",
                    "id": item["postID"],
                    "threadID": item["threadID"],
                    "userID": item["userID"],
                    "author": item["username"],
                    "time": item["time"],
                    "subject": item["subject"],
                    "text": body_text,
                }
            )

        for thread in threads:
            thread_id = thread["threadID"]
            write_json(
                thread_dir / ("%s.json" % thread_id),
                {"thread": thread_map[thread_id], "tags": tags_by_thread[thread_id], "posts": posts_by_thread[thread_id]},
            )
        for user in users:
            recent = sorted(posts_by_user[user["userID"]], key=lambda item: item["time"] or 0, reverse=True)[:80]
            write_json(user_dir / ("%s.json" % user["userID"]), {"user": user, "posts": recent})

        shouts = []
        for row in db.execute(
            "SELECT entryID,userID,username,time,message FROM wcf1_shoutbox_entry ORDER BY time DESC"
        ):
            item = dict(row)
            item["bodyHtml"] = sanitize(item.pop("message") or "")
            shouts.append(item)

        comments = []
        responses = defaultdict(list)
        for row in db.execute(
            "SELECT responseID,commentID,time,userID,username,message FROM wcf1_comment_response ORDER BY time"
        ):
            item = dict(row)
            item["bodyHtml"] = sanitize(item.pop("message") or "")
            responses[item["commentID"]].append(item)
        for row in db.execute(
            """SELECT c.commentID,c.objectTypeID,c.objectID,c.time,c.userID,c.username,c.message,
                      o.objectType FROM wcf1_comment c LEFT JOIN wcf1_object_type o USING(objectTypeID)
               ORDER BY c.time DESC"""
        ):
            item = dict(row)
            item["bodyHtml"] = sanitize(item.pop("message") or "")
            item["responses"] = responses[item["commentID"]]
            comments.append(item)

        write_json(
            data_dir / "index.json",
            {
                "generatedFrom": "DreamForum SQL dump",
                "privacy": "Private Nachrichten und zugriffsbeschränkte Forenbereiche sind aufgrund enthaltener persönlicher Daten und Doxxing-Risiken nicht öffentlich verfügbar.",
                "counts": {
                    "boards": len(boards),
                    "threads": len(threads),
                    "posts": sum(len(items) for items in posts_by_thread.values()),
                    "users": len(users),
                    "shouts": len(shouts),
                    "comments": len(comments),
                },
                "boards": boards,
                "threads": threads,
                "users": users,
            },
        )
        write_json(data_dir / "extras.json", {"shouts": shouts, "comments": comments})
        write_json(data_dir / "search.json", search)
        write_json(
            data_dir / "manifest.json",
            {
                "format": 1,
                "publicTables": [
                    "wbb1_board",
                    "wbb1_thread",
                    "wbb1_post",
                    "wcf1_user",
                    "wcf1_user_group",
                    "wcf1_user_to_group",
                    "wcf1_shoutbox_entry",
                    "wcf1_comment",
                    "wcf1_comment_response",
                    "wcf1_language_item",
                    "wcf1_object_type",
                    "wcf1_attachment",
                    "wcf1_poll",
                    "wcf1_poll_option",
                    "wcf1_tag",
                    "wcf1_tag_to_object",
                    "wcf1_like",
                ],
                "excludedPrivateTables": [
                    "wcf1_conversation",
                    "wcf1_conversation_message",
                    "wcf1_conversation_to_user",
                ],
                "excludedBoards": [230, 231],
                "threadFiles": len(threads),
                "userFiles": len(users),
            },
        )
    finally:
        db.close()


def self_check():
    source = '<p>Hello <strong>world</strong><script>alert(1)</script></p><img alt="Smiley" src="https://x">'
    rendered = sanitize(source)
    assert rendered == '<p>Hello <strong>world</strong></p><span class="missing-media">[Smiley]</span>'
    assert plain(source) == "Hello world\n[Smiley]"
    assert "script" not in rendered and "https://x" not in rendered
    rich = '<p><woltlab-metacode data-name="user">Ada</woltlab-metacode></p><woltlab-quote data-author="Bob"><p>Hallo</p></woltlab-quote>'
    rendered = sanitize(rich)
    assert '<span class="mention">@Ada</span>' in rendered
    assert '<blockquote class="archive-quote"><cite>Zitat von <strong>Bob</strong></cite><p>Hallo</p></blockquote>' in rendered


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--site", type=Path, default=DEFAULT_SITE)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    self_check()
    if not args.check:
        build(args.db, args.site)
        print("Export fertig: %s" % args.site)


if __name__ == "__main__":
    main()
