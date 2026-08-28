#!/usr/bin/env python3
"""One-command integrity check for the static public archive."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).parent
SITE = ROOT / "site"
DATA = SITE / "data"
PRIVACY = "Private Nachrichten und zugriffsbeschränkte Forenbereiche sind aufgrund enthaltener persönlicher Daten und Doxxing-Risiken nicht öffentlich verfügbar."


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    index = load(DATA / "index.json")
    manifest = load(DATA / "manifest.json")
    search = load(DATA / "search.json")
    extras = load(DATA / "extras.json")
    html = (SITE / "index.html").read_text(encoding="utf-8")
    script = (SITE / "app.js").read_text(encoding="utf-8")
    styles = (SITE / "styles.css").read_text(encoding="utf-8")
    thread_files = list((DATA / "threads").glob("*.json"))
    user_files = list((DATA / "users").glob("*.json"))

    assert index["privacy"] == PRIVACY
    assert set(manifest["excludedPrivateTables"]) == {
        "wcf1_conversation",
        "wcf1_conversation_message",
        "wcf1_conversation_to_user",
    }
    assert set(manifest["excludedBoards"]) == {230, 231}
    assert not {230, 231} & {board["boardID"] for board in index["boards"]}
    assert not {230, 231} & {thread["boardID"] for thread in index["threads"]}
    assert not any(item.get("boardID") in {230, 231} for item in search)
    assert not (DATA / "threads" / "3905.json").exists()
    assert not (DATA / "threads" / "3913.json").exists()
    assert len(thread_files) == index["counts"]["threads"] == manifest["threadFiles"]
    assert len(user_files) == index["counts"]["users"] == manifest["userFiles"]
    assert all(item["kind"] in {"thread", "post", "user"} for item in search)
    assert not any(path.suffix.lower() in {".sql", ".sqlite", ".sqlite3"} for path in SITE.rglob("*"))
    team = {user["userID"]: user["teamRole"] for user in index["users"] if user.get("teamRole")}
    assert len(team) == 25
    assert {user_id: team[user_id]["name"] for user_id in (2, 1825, 1954, 2101, 1812, 2511, 2053)} == {
        2: "Dream Owner", 1825: "Dream Leader", 1954: "Head Admin", 2101: "Administrator",
        1812: "Foren Moderator", 2511: "Test Admin", 2053: "Supporter",
    }
    assert '<html lang="de" data-theme="classic">' in html
    assert 'class="classic-nav"' in html and "dreamforum-theme" not in html + script
    assert "theme-dialog" not in html + styles and "data-theme-choice" not in html + script
    assert 'html[data-theme="classic"]' in styles and "classic-background.jpg" in styles
    assert "Die letzten 16 Beiträge" in script and "classic-shoutbox" in script
    assert "threadPageSize = 20" in script and "renderPostFooter" in script
    assert ".sort(pinnedFirst(sorts[sort] || sorts.newest))" in script
    assert 'thread-row${thread.isSticky ? " is-sticky" : ""}' in script
    assert ".thread-row.is-sticky + .thread-row:not(.is-sticky)" in styles
    assert 'BRD-${board.boardID}' not in script
    assert not any(marker in script for marker in ("USR-", "THR-", "POST-", "SHT-", "COM-", "REG-"))
    assert "requestSubmit()" in script and "shout-list" in script
    assert ".slice(0, 20).reverse()" in script and "[...payload.shouts].reverse()" in script
    assert "shouts.scrollTop = shouts.scrollHeight" in script
    assert "search-form input { color: #dceeff" in styles
    assert "🤔" in extras["shouts"][0]["bodyHtml"] and "[:thinkinghard]" not in extras["shouts"][0]["bodyHtml"]

    attachments = polls = tags = mentions = quotes = reactions = edited_posts = emojis = 0
    for path in thread_files:
        payload = load(path)
        tags += len(payload.get("tags", []))
        for post in payload.get("posts", []):
            body = post.get("bodyHtml", "").lower()
            assert "<script" not in body and "<iframe" not in body and "<img" not in body
            assert 'class="metacode"' not in body
            mentions += body.count('class="mention"')
            quotes += body.count('class="archive-quote"')
            emojis += body.count('class="archive-emoji"')
            attachments += len(post.get("attachments", []))
            polls += len(post.get("polls", []))
            reactions += len(post.get("likes", []))
            if post.get("editCount") or post.get("lastEditTime"):
                edited_posts += 1
                assert "editorID" in post and "editor" in post
    assert (attachments, polls, tags) == (433, 47, 2926)
    assert reactions == 42320 and edited_posts == 2739
    assert emojis > 10000
    assert mentions >= 150 and quotes >= 5000
    sample = load(DATA / "threads" / "5008.json")
    sample_post = next(post for post in sample["posts"] if post["postID"] == 74916)
    assert '<span class="mention">@coldenes</span>' in sample_post["bodyHtml"]
    historical = load(DATA / "threads" / "1185.json")
    historical_post = next(post for post in historical["posts"] if post["postID"] == 9737)
    assert (historical_post["editorID"], historical_post["editor"], historical_post["editCount"]) == (1825, "Nachtfrische", 15)
    assert historical_post["cumulativeLikes"] == 20
    assert sum(1 for item in historical_post["likes"] if item["value"] > 0) == 22
    assert sum(1 for item in historical_post["likes"] if item["value"] < 0) == 2

    for asset in [
        SITE / "assets" / "registry-paper-grain.png",
        SITE / "assets" / "dream-banner.png",
        SITE / "assets" / "classic-background.jpg",
        SITE / "assets" / "classic-menu.jpg",
        SITE / "assets" / "classic-menu-button.png",
        SITE / "assets" / "fonts" / "BarlowCondensed-Medium.ttf",
        SITE / "assets" / "fonts" / "BarlowCondensed-SemiBold.ttf",
        SITE / "assets" / "fonts" / "BarlowCondensed-Black.ttf",
        SITE / "assets" / "fonts" / "OFL.txt",
    ]:
        assert asset.is_file() and asset.stat().st_size > 0, asset

    subprocess.run(["node", "--check", str(SITE / "app.js")], check=True)
    subprocess.run([sys.executable, str(ROOT / "build_data.py"), "--check"], check=True)
    print(
        "OK: {boards} Boards, {threads} Threads, {posts} Beiträge, {users} Mitglieder; "
        "433 Anhänge, 47 Umfragen, 2.926 Tags, {mentions} Mentions, {quotes} Zitate, "
        "42.320 Reaktionen, 2.739 bearbeitete Beiträge und {emojis} ersetzte Smiley-Codes; "
        "keine privaten Tabellen oder geschützten Boards im Export.".format(mentions=mentions, quotes=quotes, emojis=emojis, **index["counts"])
    )


if __name__ == "__main__":
    main()
