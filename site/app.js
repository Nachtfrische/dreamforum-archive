"use strict";

const main = document.querySelector("#archive-main");
const live = document.querySelector(".live-region");
const numberFormat = new Intl.NumberFormat("de-DE");
const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
const pageSize = 40;
const threadPageSize = 20;
let archive;
let boardsById;
let usersById;
let threadsById;
let searchIndex;
let extras;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));
const formatNumber = (value) => numberFormat.format(Number(value) || 0);
const formatDate = (timestamp) => timestamp ? dateFormat.format(new Date(timestamp * 1000)) : "–";
const formatBytes = (value) => {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toLocaleString("de-DE", { maximumFractionDigits: 1 })} KB`;
  return `${(bytes / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 1 })} MB`;
};

function seedFor(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function avatar(userId, username, className = "") {
  const seed = seedFor(userId || username || "guest");
  const grounds = ["#83ddc5", "#b8d4ff", "#ff8a70", "#f1d58c", "#c9b7ee", "#a9d49b", "#efb6c8", "#8fd0dc", "#e3b47d", "#b7c2cf"];
  const groundMarks = ["#ff6542", "#012043", "#f1d58c", "#83ddc5", "#b8d4ff"];
  const skins = ["#f6d6bc", "#f0c19d", "#e4aa7c", "#c98961", "#a86849", "#87533d", "#684133", "#f0cdb2"];
  const hairs = ["#10213f", "#6d3e31", "#d59a34", "#2c493e", "#805d3f", "#252525", "#b46d55", "#ece2cf"];
  const shirts = ["#10213f", "#ff6542", "#386b65", "#805d8d", "#b15b45", "#2f5f8c", "#78633c", "#37434f"];
  const ground = grounds[seed % grounds.length];
  const groundMark = groundMarks[(seed >>> 3) % groundMarks.length];
  const skin = skins[(seed >>> 4) % skins.length];
  const hair = hairs[(seed >>> 8) % hairs.length];
  const shirt = shirts[(seed >>> 11) % shirts.length];
  const face = [{ rx: 23, ry: 28 }, { rx: 20, ry: 29 }, { rx: 25, ry: 25 }, { rx: 22, ry: 31 }, { rx: 26, ry: 28 }][(seed >>> 14) % 5];
  const hairStyle = (seed >>> 17) % 10;
  const hairBack = [2, 6].includes(hairStyle) ? `<path d="M25 42 Q22 18 50 16 Q78 18 75 42 V78 H63 V39 H37 V78 H25Z" fill="${hair}"/>` : "";
  const hairMarkup = [
    `<path d="M27 45 Q28 17 50 17 Q75 18 74 45 Q63 36 55 29 Q43 44 27 45Z" fill="${hair}"/>`,
    `<path d="M27 43 Q27 18 50 18 Q73 18 74 43 Q64 31 50 31 Q36 31 27 43Z M27 38 Q18 51 27 66Z" fill="${hair}"/>`,
    `<path d="M28 45 Q27 18 49 17 Q72 18 73 45 Q61 39 53 27 Q44 38 28 45Z" fill="${hair}"/>`,
    `<path d="M26 46 Q24 22 50 16 Q76 21 74 46 L67 33 L60 43 L52 29 L43 42 L34 32Z" fill="${hair}"/>`,
    `<path d="M29 39 Q28 20 50 19 Q72 20 71 39 Q61 30 50 31 Q39 30 29 39Z" fill="${hair}"/>`,
    `<circle cx="32" cy="31" r="12" fill="${hair}"/><circle cx="44" cy="23" r="13" fill="${hair}"/><circle cx="58" cy="23" r="13" fill="${hair}"/><circle cx="69" cy="33" r="12" fill="${hair}"/>`,
    `<path d="M26 45 Q25 18 50 16 Q76 19 74 45 Q60 32 47 29 Q40 40 26 45Z" fill="${hair}"/><path d="M25 42 V71 Q30 79 36 72 V39Z" fill="${hair}"/><path d="M75 42 V71 Q70 79 64 72 V39Z" fill="${hair}"/>`,
    `<path d="M29 39 Q30 20 50 19 Q69 20 71 39 L64 33 L58 40 L51 31 L43 40 L36 32Z" fill="${hair}"/>`,
    "",
    `<path d="M27 42 Q29 19 50 18 Q71 19 73 42 Q59 35 48 27 Q41 37 27 42Z" fill="${hair}"/><path d="M69 31 Q80 38 72 52" fill="none" stroke="${hair}" stroke-width="7"/>`,
  ][hairStyle];
  const eyeStyle = (seed >>> 21) % 6;
  const eyes = [
    '<circle cx="41" cy="52" r="2.3" fill="#012043"/><circle cx="59" cy="52" r="2.3" fill="#012043"/>',
    '<path d="M37 53 Q41 49 45 53M55 53 Q59 49 63 53" fill="none" stroke="#012043" stroke-width="2.2"/>',
    '<ellipse cx="41" cy="52" rx="2.1" ry="2.8" fill="#012043"/><ellipse cx="59" cy="52" rx="2.1" ry="2.8" fill="#012043"/>',
    '<circle cx="40" cy="52" r="6" fill="none" stroke="#012043" stroke-width="2"/><circle cx="60" cy="52" r="6" fill="none" stroke="#012043" stroke-width="2"/><path d="M46 52 H54" stroke="#012043" stroke-width="2"/><circle cx="40" cy="52" r="1.8" fill="#012043"/><circle cx="60" cy="52" r="1.8" fill="#012043"/>',
    '<rect x="34" y="46" width="14" height="11" fill="none" stroke="#012043" stroke-width="2"/><rect x="52" y="46" width="14" height="11" fill="none" stroke="#012043" stroke-width="2"/><path d="M48 51 H52" stroke="#012043" stroke-width="2"/><circle cx="41" cy="52" r="1.8" fill="#012043"/><circle cx="59" cy="52" r="1.8" fill="#012043"/>',
    '<ellipse cx="41" cy="52" rx="2.3" ry="3.2" fill="#012043"/><ellipse cx="59" cy="52" rx="2.3" ry="3.2" fill="#012043"/>',
  ][eyeStyle];
  const mouth = [
    "M42 67 Q50 72 58 67", "M43 68 H57", "M42 69 Q50 64 58 69", "M45 67 Q50 70 55 67", "M42 66 Q50 74 58 66", "M46 68 H54",
  ][(seed >>> 24) % 6];
  const detail = [
    "",
    '<circle cx="36" cy="61" r="1" fill="#a86849"/><circle cx="40" cy="62" r="1" fill="#a86849"/><circle cx="64" cy="61" r="1" fill="#a86849"/><circle cx="60" cy="62" r="1" fill="#a86849"/>',
    `<path d="M35 63 Q50 83 65 63 Q61 82 50 83 Q39 82 35 63Z" fill="${hair}" opacity=".92"/>`,
    `<path d="M42 63 Q50 58 58 63 Q50 67 42 63Z" fill="${hair}"/>`,
    '<circle cx="27" cy="58" r="2.4" fill="#ff6542"/><circle cx="73" cy="58" r="2.4" fill="#ff6542"/>',
    `<path d="M27 38 H73" stroke="${groundMark}" stroke-width="5"/>`,
    `<path d="M25 46 Q18 52 23 67M75 46 Q82 52 77 67" fill="none" stroke="#012043" stroke-width="5"/><path d="M21 65 V74M79 65 V74" stroke="#012043" stroke-width="5"/>`,
    `<path d="M23 39 Q28 18 50 17 Q72 18 77 39Z" fill="${groundMark}"/><path d="M20 40 H80" stroke="#012043" stroke-width="3"/>`,
  ][(seed >>> 27) % 8];
  const backgroundShape = (seed & 1) ? `<path d="M0 0 H100 L0 100Z" fill="${groundMark}" opacity=".18"/>` : `<circle cx="84" cy="16" r="32" fill="${groundMark}" opacity=".18"/>`;
  return `<svg class="avatar ${className}" viewBox="0 0 100 100" role="img" aria-label="Generierter Avatar von ${escapeHtml(username || "Gast")}">
    <rect width="100" height="100" fill="${ground}"/>
    ${backgroundShape}${hairBack}
    <path d="M14 100 Q21 74 50 74 Q79 74 86 100" fill="${shirt}"/>
    ${(seed >>> 13) & 1 ? '<path d="M39 77 L50 89 L61 77" fill="#f6f4ef" opacity=".82"/>' : '<path d="M32 82 Q50 92 68 82" fill="none" stroke="#012043" stroke-width="3" opacity=".5"/>'}
    <ellipse cx="50" cy="49" rx="${face.rx}" ry="${face.ry}" fill="${skin}"/>
    <ellipse cx="27" cy="53" rx="3" ry="6" fill="${skin}"/><ellipse cx="73" cy="53" rx="3" ry="6" fill="${skin}"/>
    ${hairMarkup}${eyes}
    <path d="M49 55 L47 61 H52" fill="none" stroke="#9b6044" stroke-width="1.4" opacity=".65"/>
    <path d="${mouth}" fill="none" stroke="#012043" stroke-width="2.3" stroke-linecap="round"/>
    ${detail}
  </svg>`;
}

function userName(userId, username, className = "") {
  const role = usersById?.get(Number(userId))?.teamRole;
  return `<span class="user-name ${role ? "team-name" : ""} ${className}"${role ? ` style="--team-color:${escapeHtml(role.color)}" title="${escapeHtml(role.name)}"` : ""}>${escapeHtml(username || "Gast")}</span>`;
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Archivdatei konnte nicht geladen werden (${response.status}).`);
  return response.json();
}

function route() {
  const raw = location.hash.slice(1) || "/";
  const [path, queryString = ""] = raw.split("?");
  return {
    parts: path.split("/").filter(Boolean).map(decodeURIComponent),
    query: new URLSearchParams(queryString),
  };
}

function setRoute(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });
  location.hash = `#${path}${query.size ? `?${query}` : ""}`;
}

function setCurrentNav(first) {
  const section = !first ? "home" : ["board", "thread"].includes(first) ? "boards" : first === "user" ? "users" : first;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === section;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function pageHeading(title, description, titleHtml = "") {
  return `<div class="page-heading"><div><h1>${titleHtml || escapeHtml(title)}</h1></div><p>${escapeHtml(description)}</p></div>`;
}

function threadRow(thread) {
  return `<a class="thread-row" href="#/thread/${thread.threadID}">
    <span>${thread.isSticky ? '<span class="thread-id">ANGEHEFTET</span>' : ""}<strong class="thread-title">${escapeHtml(thread.topic || "(ohne Titel)")}</strong><span class="thread-author">${userName(thread.userID, thread.username)}</span></span>
    <span class="thread-date">${formatDate(thread.lastPostTime)}</span>
    <span class="thread-metrics"><strong>${formatNumber(thread.replies)} Antworten</strong>${formatNumber(thread.views)} historische Aufrufe</span>
  </a>`;
}

function classicHome() {
  const shouts = (extras?.shouts || []).slice(0, 6);
  const latest = [...archive.threads].sort((a, b) => b.lastPostTime - a.lastPostTime).slice(0, 16);
  return `<section class="classic-home">
    <section class="classic-panel classic-shoutbox"><h2>Shoutbox</h2><div>${shouts.map((item) => `<article class="classic-shout">${avatar(item.userID, item.username)}<div><div class="classic-shout-meta">${userName(item.userID, item.username)}<time>${formatDate(item.time)}</time></div><div class="post-content">${item.bodyHtml || "<p>(Leerer Eintrag)</p>"}</div></div></article>`).join("")}</div><a class="classic-panel-link" href="#/extras">Alle Shouts anzeigen</a></section>
    <section class="classic-panel classic-latest"><h2>Die letzten 16 Beiträge</h2><div class="classic-latest-head"><span>Thema</span><span>Antworten</span><span>Likes</span><span>Zugriffe</span><span>Letzte Antwort</span></div><div>${latest.map((thread) => {
      const board = boardsById.get(thread.boardID);
      const likes = Number(thread.cumulativeLikes) || 0;
      const likeClass = likes > 0 ? "is-positive" : likes < 0 ? "is-negative" : "is-neutral";
      return `<a class="classic-latest-row" href="#/thread/${thread.threadID}"><span class="classic-latest-topic">${avatar(thread.userID, thread.username)}<span><strong>${escapeHtml(thread.topic || "(ohne Titel)")}</strong><small>${userName(thread.userID, thread.username)}${board ? ` · ${escapeHtml(board.title)}` : ""}</small></span></span><span class="classic-latest-metric"><strong>${formatNumber(thread.replies)}</strong><small>Antworten</small></span><span class="classic-like ${likeClass}">${likes > 0 ? "+" : ""}${formatNumber(likes)}<small>Likes</small></span><span class="classic-latest-metric"><strong>${formatNumber(thread.views)}</strong><small>Zugriffe</small></span><span class="classic-last-reply">${avatar(0, thread.lastPoster || "Gast", "classic-last-avatar")}<span><strong>${escapeHtml(thread.lastPoster || "Unbekannt")}</strong><small>${formatDate(thread.lastPostTime)}</small></span></span></a>`;
    }).join("")}</div></section>
  </section>`;
}

function orderedBoards() {
  const children = new Map();
  archive.boards.forEach((board) => {
    const parent = boardsById.has(board.parentID) ? board.parentID : 0;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(board);
  });
  children.forEach((items) => items.sort((a, b) => a.position - b.position || a.boardID - b.boardID));
  const result = [];
  const visit = (parent, depth) => (children.get(parent) || []).forEach((board) => {
    result.push({ board, depth });
    visit(board.boardID, depth + 1);
  });
  visit(0, 0);
  return result;
}

function boardRows(limit = Infinity) {
  const stats = new Map(archive.boards.map((board) => [board.boardID, { count: 0, latest: null }]));
  archive.threads.forEach((thread) => {
    const item = stats.get(thread.boardID);
    if (!item) return;
    item.count += 1;
    if (!item.latest || thread.lastPostTime > item.latest.lastPostTime) item.latest = thread;
  });
  const ordered = orderedBoards();
  [...ordered].reverse().forEach(({ board }) => {
    const parent = stats.get(board.parentID);
    const own = stats.get(board.boardID);
    if (!parent || !own) return;
    parent.count += own.count;
    if (own.latest && (!parent.latest || own.latest.lastPostTime > parent.latest.lastPostTime)) parent.latest = own.latest;
  });
  return ordered.slice(0, limit).map(({ board, depth }) => {
    const { count, latest: last } = stats.get(board.boardID);
    return `<a class="board-entry depth-${Math.min(depth, 3)}" href="#/board/${board.boardID}" style="--depth:${Math.min(depth, 3)}">
      <span class="board-branch" aria-hidden="true"></span>
      <span class="board-copy"><strong>${escapeHtml(board.title)}</strong>${board.description ? `<span>${escapeHtml(board.description)}</span>` : ""}</span>
      <span class="board-activity"><strong>${formatNumber(count)}</strong><span>Threads</span></span>
      <span class="board-last">${last ? `<strong>${escapeHtml(last.topic || "(ohne Titel)")}</strong><span>${formatDate(last.lastPostTime)}</span>` : "<span>Keine Threads</span>"}</span>
    </a>`;
  }).join("");
}

function pager(page, total, base, query = {}, perPage = pageSize) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages === 1) return "";
  const prev = Math.max(1, page - 1);
  const next = Math.min(pages, page + 1);
  const href = (target) => `#${base}?${new URLSearchParams({ ...query, page: target })}`;
  const visible = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2]);
  const pageLinks = [...visible].filter((item) => item >= 1 && item <= pages).sort((a, b) => a - b);
  let last = 0;
  const numbers = pageLinks.map((item) => {
    const gap = item - last > 1 ? '<span class="pager-gap" aria-hidden="true">…</span>' : "";
    last = item;
    return `${gap}<a class="pager-page" href="${href(item)}"${item === page ? ' aria-current="page"' : ""}>${item}</a>`;
  }).join("");
  return `<nav class="pager" aria-label="Seitennavigation">
    <a class="pager-step" href="${href(prev)}" ${page === 1 ? 'aria-disabled="true" tabindex="-1"' : ""}>Zurück</a>
    <span class="pager-pages">${numbers}</span>
    <a class="pager-step" href="${href(next)}" ${page === pages ? 'aria-disabled="true" tabindex="-1"' : ""}>Weiter</a>
  </nav>`;
}

function renderHome() {
  main.innerHTML = `${classicHome()}
  <section class="content-section forum-preview"><div class="section-heading"><h2>Forenübersicht</h2><p>Alle Bereiche, Unterforen und zuletzt aktiven Threads direkt auf einen Blick.</p></div><div class="board-list">${boardRows()}</div></section>`;
}

function renderBoards() {
  main.innerHTML = `<section class="page-banner"><div class="page-shell">${pageHeading("Boards", "Die originale Hierarchie als Register – von Hauptbereichen bis zu den kleinsten Unterforen.")}</div></section>
  <section class="page-shell"><div class="board-list">${boardRows()}</div></section>`;
}

function renderBoard(boardId, query) {
  const board = boardsById.get(boardId);
  if (!board) return renderError("Board nicht gefunden", "Diese Archivnummer existiert nicht.");
  const q = (query.get("q") || "").trim().toLocaleLowerCase("de");
  const sort = query.get("sort") || "newest";
  const page = Math.max(1, Number(query.get("page")) || 1);
  const sorts = {
    newest: (a, b) => b.lastPostTime - a.lastPostTime,
    oldest: (a, b) => a.time - b.time,
    replies: (a, b) => b.replies - a.replies,
    views: (a, b) => b.views - a.views,
    title: (a, b) => String(a.topic).localeCompare(String(b.topic), "de"),
  };
  const family = new Set([boardId]);
  let added = true;
  while (added) {
    added = false;
    archive.boards.forEach((item) => {
      if (family.has(item.parentID) && !family.has(item.boardID)) {
        family.add(item.boardID);
        added = true;
      }
    });
  }
  const items = archive.threads.filter((item) => family.has(item.boardID) && (!q || `${item.topic} ${item.username}`.toLocaleLowerCase("de").includes(q))).sort(sorts[sort] || sorts.newest);
  const slice = items.slice((page - 1) * pageSize, page * pageSize);
  const children = archive.boards.filter((item) => item.parentID === boardId);
  main.innerHTML = `<section class="page-banner"><div class="page-shell"><div class="breadcrumbs"><a href="#/boards">Boards</a> / ${escapeHtml(board.title)}</div>${pageHeading(board.title, board.description || `Alle überlieferten Threads dieses Bereichs${family.size > 1 ? " inklusive Unterforen" : ""}.`)}</div></section>
  <section class="page-shell">
    ${children.length ? `<div class="tabs">${children.map((child) => `<a class="button secondary" href="#/board/${child.boardID}">${escapeHtml(child.title)}</a>`).join("")}</div>` : ""}
    <form class="toolbar" data-board-filter data-board-id="${boardId}">
      <label><span>In diesem Board filtern</span><input class="control" name="q" type="search" value="${escapeHtml(query.get("q") || "")}" placeholder="Titel oder Autor"></label>
      <label><span>Sortierung</span><select class="control" name="sort"><option value="newest">Zuletzt aktiv</option><option value="oldest">Älteste zuerst</option><option value="replies">Meiste Antworten</option><option value="views">Meiste Aufrufe</option><option value="title">Titel A–Z</option></select></label>
    </form>
    <div class="thread-list">${slice.map(threadRow).join("") || '<div class="empty-state"><p>Keine passenden Threads.</p></div>'}</div>
    ${pager(page, items.length, `/board/${boardId}`, { q: query.get("q") || "", sort })}
  </section>`;
  main.querySelector('select[name="sort"]').value = sort;
}

function renderPoll(poll) {
  const total = Number(poll.votes) || poll.options.reduce((sum, option) => sum + (Number(option.votes) || 0), 0);
  return `<section class="poll" aria-label="Archivierte Umfrage"><span class="archive-id">UMFRAGE · ${formatNumber(total)} STIMMEN</span><h3>${escapeHtml(poll.question || "Umfrage")}</h3><div class="poll-options">${poll.options.map((option) => {
    const percent = total ? Math.round((Number(option.votes) || 0) / total * 100) : 0;
    return `<div class="poll-option"><div><span>${escapeHtml(option.optionValue || "(ohne Text)")}</span><strong>${percent}%</strong></div><span class="poll-meter"><i style="width:${percent}%"></i></span><small>${formatNumber(option.votes)} Stimmen</small></div>`;
  }).join("")}</div></section>`;
}

function renderAttachments(items) {
  if (!items?.length) return "";
  return `<section class="attachments"><span class="archive-id">DATEIANHÄNGE · NUR METADATEN</span>${items.map((item) => `<div class="attachment"><span class="attachment-mark" aria-hidden="true">ANH</span><span><strong>${escapeHtml(item.filename || `Anhang ${item.attachmentID}`)}</strong><small>${escapeHtml(item.fileType || "Datei")} · ${formatBytes(item.filesize)} · ${formatNumber(item.downloads)} historische Downloads</small></span><em>Datei nicht im Dump</em></div>`).join("")}</section>`;
}

function linkedUser(userId, username) {
  const name = userName(userId, username);
  return userId ? `<a href="#/user/${userId}">${name}</a>` : name;
}

function renderPostAuthor(post) {
  const user = usersById.get(Number(post.userID));
  const title = user?.teamRole?.name || user?.userTitle || (post.userID ? "Mitglied" : "Gast");
  const profile = post.userID ? `#/user/${post.userID}` : "#/users";
  return `<aside class="post-author">
    <a class="post-author-main" href="${profile}">${userName(post.userID, post.username)}${avatar(post.userID, post.username)}</a>
    <span class="post-author-title">${escapeHtml(title)}</span>
    ${user ? `<dl class="post-author-stats"><div><dt>Likes erhalten</dt><dd>${formatNumber(user.likesReceived)}</dd></div><div><dt>Punkte</dt><dd>${formatNumber(user.activityPoints)}</dd></div><div><dt>Beiträge</dt><dd>${formatNumber(user.wbbPosts)}</dd></div><div><dt>Registriert</dt><dd>${formatDate(user.registrationDate)}</dd></div></dl>` : ""}
  </aside>`;
}

function renderReactionGroup(items, label, className) {
  if (!items.length) return "";
  const names = items.map((item) => linkedUser(item.userID, item.username)).join(", ");
  if (items.length <= 8) return `<div class="reaction-line ${className}"><strong>${label} (${formatNumber(items.length)}):</strong> ${names}</div>`;
  const preview = items.slice(0, 4).map((item) => linkedUser(item.userID, item.username)).join(", ");
  return `<details class="reaction-line ${className}"><summary><strong>${label} (${formatNumber(items.length)}):</strong> ${preview} und ${formatNumber(items.length - 4)} weitere</summary><div>${names}</div></details>`;
}

function renderPostFooter(post) {
  const likes = post.likes || [];
  const positive = likes.filter((item) => Number(item.value) > 0);
  const negative = likes.filter((item) => Number(item.value) < 0);
  const editorName = post.editor || usersById.get(Number(post.editorID))?.username || "Unbekannt";
  const editNote = Number(post.editCount) > 0 || post.lastEditTime
    ? `<p class="post-edit-note">Dieser Beitrag wurde ${formatNumber(post.editCount || 1)}-mal editiert, zuletzt von ${linkedUser(post.editorID, editorName)}${post.lastEditTime ? ` am ${formatDate(post.lastEditTime)}` : ""}.${post.editReason ? ` Grund: ${escapeHtml(post.editReason)}` : ""}</p>`
    : "";
  if (!editNote && !likes.length) return "";
  return `<footer class="post-footer">${editNote}${renderReactionGroup(positive, "Gefällt", "is-positive")}${renderReactionGroup(negative, "Gefällt nicht", "is-negative")}</footer>`;
}

async function renderThread(threadId, query) {
  let payload;
  try { payload = await getJson(`data/threads/${threadId}.json`); }
  catch { return renderError("Thread nicht lesbar", "Der Thread ist leer, gelöscht oder im Dump nicht vollständig enthalten."); }
  const thread = payload.thread || threadsById.get(threadId);
  const posts = payload.posts || [];
  const pages = Math.max(1, Math.ceil(posts.length / threadPageSize));
  const page = Math.min(pages, Math.max(1, Number(query.get("page")) || 1));
  const sliceStart = (page - 1) * threadPageSize;
  const slice = posts.slice(sliceStart, sliceStart + threadPageSize);
  const board = boardsById.get(thread.boardID);
  const saved = Number(localStorage.getItem(`dreamforum-read-${threadId}`)) || 0;
  const savedIndex = posts.findIndex((item) => item.postID === saved);
  const savedPage = savedIndex >= 0 ? Math.floor(savedIndex / threadPageSize) + 1 : 0;
  const tags = payload.tags || [];
  const pageNav = pager(page, posts.length, `/thread/${threadId}`, {}, threadPageSize);
  main.innerHTML = `<section class="page-banner thread-banner"><div class="page-shell"><div class="breadcrumbs"><a href="#/">Forum</a> / ${board ? `<a href="#/board/${board.boardID}">${escapeHtml(board.title)}</a>` : "Unbekannt"}</div>${pageHeading(thread.topic || "(ohne Titel)", `${formatNumber(posts.length)} Beiträge · ${formatNumber(thread.views)} Aufrufe · begonnen ${formatDate(thread.time)}`)}${tags.length ? `<div class="tag-list" aria-label="Tags">${tags.map((tag) => `<span>${escapeHtml(tag.name)}</span>`).join("")}</div>` : ""}${savedPage && savedPage !== page ? `<p><a class="button" href="#/thread/${threadId}?page=${savedPage}&post=${saved}">Bei gespeicherter Leseposition weiterlesen</a></p>` : ""}</div></section>
  <section class="posts">${pageNav}${slice.map((post, index) => {
    const postNumber = sliceStart + index + 1;
    const score = Number(post.cumulativeLikes) || 0;
    const scoreClass = score > 0 ? "is-positive" : score < 0 ? "is-negative" : "is-neutral";
    return `<article class="post ${saved === post.postID ? "read-marker" : ""}" id="post-${post.postID}">
      ${renderPostAuthor(post)}
      <div class="post-body"><header class="post-meta"><div><strong>${escapeHtml(post.subject || thread.topic || "Beitrag")}</strong><time>${formatDate(post.time)}</time></div><div class="post-actions">${score ? `<span class="post-score ${scoreClass}" title="Like-Saldo">${score > 0 ? "+" : ""}${formatNumber(score)}</span>` : ""}<a class="post-number" href="#/thread/${threadId}?page=${page}&post=${post.postID}">#${postNumber}</a><button class="button secondary" type="button" data-mark-read="${post.postID}" data-thread="${threadId}">Bis hier gelesen</button></div></header><div class="post-content">${post.bodyHtml || "<p>(Leerer Beitrag)</p>"}</div>${(post.polls || []).map(renderPoll).join("")}${renderAttachments(post.attachments)}${renderPostFooter(post)}</div>
    </article>`;
  }).join("") || '<div class="empty-state"><p>Keine lesbaren Beiträge.</p></div>'}${pageNav}</section>`;
  const targetPost = Number(query.get("post"));
  if (targetPost) requestAnimationFrame(() => document.querySelector(`#post-${targetPost}`)?.scrollIntoView({ block: "center" }));
}

function renderUsers(query) {
  const q = (query.get("q") || "").trim().toLocaleLowerCase("de");
  const sort = query.get("sort") || "posts";
  const page = Math.max(1, Number(query.get("page")) || 1);
  const sorts = {
    posts: (a, b) => (b.wbbPosts || 0) - (a.wbbPosts || 0),
    likes: (a, b) => (b.likesReceived || 0) - (a.likesReceived || 0),
    name: (a, b) => a.username.localeCompare(b.username, "de"),
    recent: (a, b) => (b.lastActivityTime || 0) - (a.lastActivityTime || 0),
    joined: (a, b) => (a.registrationDate || 0) - (b.registrationDate || 0),
  };
  const items = archive.users.filter((item) => !q || item.username.toLocaleLowerCase("de").includes(q)).sort(sorts[sort] || sorts.posts);
  const slice = items.slice((page - 1) * pageSize, page * pageSize);
  main.innerHTML = `<section class="page-banner"><div class="page-shell">${pageHeading("Mitglieder", "Profile werden aus öffentlichen Archivfeldern rekonstruiert. Die Avatare sind konsistent aus der Benutzer-ID erzeugt.")}</div></section>
  <section class="page-shell"><form class="toolbar" data-user-filter><label><span>Name filtern</span><input class="control" type="search" name="q" value="${escapeHtml(query.get("q") || "")}" placeholder="Benutzername"></label><label><span>Sortierung</span><select class="control" name="sort"><option value="posts">Meiste Beiträge</option><option value="likes">Meiste Likes</option><option value="name">Name A–Z</option><option value="recent">Zuletzt aktiv</option><option value="joined">Früh registriert</option></select></label></form>
  <div class="people-list">${slice.map((user) => `<a class="person-row" href="#/user/${user.userID}">${avatar(user.userID, user.username)}<span>${userName(user.userID, user.username, "person-name")}<span class="muted">${escapeHtml(user.userTitle || "Mitglied")}</span></span><span class="number-cell"><strong>${formatNumber(user.wbbPosts)}</strong><span>Beiträge</span></span><span class="number-cell points-cell"><strong>${formatNumber(user.activityPoints)}</strong><span>Punkte</span></span><span class="number-cell likes-cell"><strong>${formatNumber(user.likesReceived)}</strong><span>Likes</span></span></a>`).join("") || '<div class="empty-state"><p>Niemand gefunden.</p></div>'}</div>${pager(page, items.length, "/users", { q: query.get("q") || "", sort })}</section>`;
  main.querySelector('select[name="sort"]').value = sort;
}

async function renderUser(userId) {
  const user = usersById.get(userId);
  if (!user) return renderError("Profil nicht gefunden", "Diese Benutzer-ID ist im Archiv nicht vorhanden.");
  let payload = { posts: [] };
  try { payload = await getJson(`data/users/${userId}.json`); } catch {}
  main.innerHTML = `<section class="page-banner"><div class="page-shell"><div class="breadcrumbs"><a href="#/users">Mitglieder</a> / ${escapeHtml(user.username)}</div><div class="profile-lead">${avatar(user.userID, user.username)}<div>${pageHeading(user.username, user.userTitle || "Mitglied", userName(user.userID, user.username))}<div class="profile-stats"><span><strong>${formatNumber(user.wbbPosts)}</strong>Beiträge</span><span><strong>${formatNumber(user.activityPoints)}</strong>Punkte</span><span><strong>${formatNumber(user.likesReceived)}</strong>Likes</span><span><strong>${formatNumber(user.profileHits)}</strong>Profilaufrufe</span></div></div></div></div></section>
  <section class="page-shell">${user.signatureHtml ? `<div class="signature"><span class="archive-id">SIGNATUR</span><div class="post-content">${user.signatureHtml}</div></div>` : ""}<div class="section-heading"><h2>Letzte Beiträge</h2><p>Bis zu 80 zuletzt veröffentlichte Beiträge dieses Profils.</p></div><div class="thread-list">${payload.posts.map((post) => { const thread = threadsById.get(post.threadID); return `<a class="thread-row" href="#/thread/${post.threadID}?post=${post.postID}"><span><strong class="thread-title">${escapeHtml(thread?.topic || post.subject || "Beitrag")}</strong><span class="thread-author">${escapeHtml(post.text)}</span></span><span class="thread-date">${formatDate(post.time)}</span><span class="thread-metrics"><strong>Öffnen</strong>im Thread</span></a>`; }).join("") || '<div class="empty-state"><p>Keine öffentlichen Beiträge gefunden.</p></div>'}</div></section>`;
}

async function renderExtras(query) {
  const payload = extras || await getJson("data/extras.json");
  const tab = query.get("tab") === "comments" ? "comments" : "shouts";
  const items = tab === "comments" ? payload.comments : payload.shouts;
  main.innerHTML = `<section class="page-banner"><div class="page-shell">${pageHeading("Nebenräume", "Shoutbox und Kommentare – die kürzeren Gespräche neben den eigentlichen Boards.")}</div></section><section class="page-shell"><div class="tabs" aria-label="Nebenraum auswählen"><button class="${tab === "shouts" ? "active" : ""}" data-extra-tab="shouts">Shoutbox (${formatNumber(payload.shouts.length)})</button><button class="${tab === "comments" ? "active" : ""}" data-extra-tab="comments">Kommentare (${formatNumber(payload.comments.length)})</button></div><div class="conversation-list ${tab === "shouts" ? "shout-list" : "comment-list"}">${items.map((item) => `<article class="conversation-fragment"><div>${avatar(item.userID, item.username)}${userName(item.userID, item.username)}<div class="muted">${formatDate(item.time)}</div></div><div class="post-content">${item.bodyHtml || "<p>(Leerer Eintrag)</p>"}${item.responses?.map((response) => `<blockquote>${userName(response.userID, response.username)} · ${formatDate(response.time)}<div>${response.bodyHtml}</div></blockquote>`).join("") || ""}</div></article>`).join("") || '<div class="empty-state"><p>Keine Einträge.</p></div>'}</div></section>`;
}

function renderMessages() {
  main.innerHTML = `<section class="notice"><h1>Privates bleibt privat.</h1><p>${escapeHtml(archive.privacy)} Deshalb enthält diese öffentliche Ausgabe weder Betreffzeilen noch Teilnehmerlisten, Inhalte oder Suchtreffer aus privaten Konversationen.</p></section>`;
}

function highlighted(text, query) {
  const safe = escapeHtml(text || "");
  const escapedQuery = String(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escapedQuery})`, "ig"), "<mark>$1</mark>");
}

async function renderSearch(query) {
  const q = (query.get("q") || "").trim();
  main.innerHTML = `<section class="page-banner"><div class="page-shell">${pageHeading("Archivsuche", "Die Volltextsuche lädt den öffentlichen Suchindex erst, wenn du sie wirklich benutzt.")}<form class="search-form" data-search-form><label><span>Suchbegriff</span><input name="q" type="search" minlength="2" value="${escapeHtml(q)}" placeholder="Mindestens zwei Zeichen" autofocus></label><button type="submit">Suchen</button></form></div></section><section class="page-shell" id="search-results">${q.length >= 2 ? '<div class="loading-screen"><span class="loading-mark"></span><p>Öffentlicher Volltextindex wird geladen …</p></div>' : '<div class="empty-state"><p>Suche nach Threads, Beiträgen oder Mitgliedern.</p></div>'}</section>`;
  if (q.length < 2) return;
  if (!searchIndex) searchIndex = await getJson("data/search.json");
  const needle = q.toLocaleLowerCase("de");
  const results = searchIndex.filter((item) => `${item.subject || ""}\n${item.author || ""}\n${item.text || ""}`.toLocaleLowerCase("de").includes(needle)).sort((a, b) => (b.time || 0) - (a.time || 0));
  const limited = results.slice(0, 160);
  document.querySelector("#search-results").innerHTML = `<p class="search-status">${formatNumber(results.length)} Treffer${results.length > limited.length ? ` · die neuesten ${limited.length} werden gezeigt` : ""}</p><div>${limited.map((item) => {
    const target = item.kind === "user" ? `#/user/${item.id}` : item.kind === "thread" ? `#/thread/${item.id}` : `#/thread/${item.threadID}?post=${item.id}`;
    const label = item.kind === "user" ? "MITGLIED" : item.kind === "thread" ? "THREAD" : "BEITRAG";
    return `<article class="search-hit"><span class="archive-id">${label}</span><div><a href="${target}">${highlighted(item.subject || item.author || "Treffer", q)}</a></div><p class="muted">${highlighted((item.text || "").slice(0, 320), q)}</p><span class="muted">${userName(item.userID, item.author)} · ${formatDate(item.time)}</span></article>`;
  }).join("") || '<div class="empty-state"><p>Nichts gefunden. Versuch einen kürzeren oder anders geschriebenen Begriff.</p></div>'}</div>`;
  live.textContent = `${results.length} Suchtreffer`;
}

function renderError(title, message) {
  main.innerHTML = `<section class="error-state"><span class="archive-id">ARCHIVFEHLER</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="button" href="#/">Zur Übersicht</a></section>`;
}

async function render() {
  if (!archive) return;
  const current = route();
  const [first, id] = current.parts;
  setCurrentNav(first);
  main.setAttribute("aria-busy", "true");
  try {
    if (!first) renderHome();
    else if (first === "boards") renderBoards();
    else if (first === "board") renderBoard(Number(id), current.query);
    else if (first === "thread") await renderThread(Number(id), current.query);
    else if (first === "users") renderUsers(current.query);
    else if (first === "user") await renderUser(Number(id));
    else if (first === "extras") await renderExtras(current.query);
    else if (first === "messages") renderMessages();
    else if (first === "search") await renderSearch(current.query);
    else renderError("Seite nicht gefunden", "Dieser Registerpfad ist nicht belegt.");
  } catch (error) {
    console.error(error);
    renderError("Archiv konnte nicht geöffnet werden", `${error.message} Starte den mitgelieferten lokalen Webserver und lade die Seite erneut.`);
  } finally {
    main.setAttribute("aria-busy", "false");
  }
  if (!current.query.get("post")) scrollTo({ top: 0, behavior: "instant" });
  main.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-extra-tab]");
  if (tab) setRoute("/extras", { tab: tab.dataset.extraTab });
  const marker = event.target.closest("[data-mark-read]");
  if (marker) {
    const postId = Number(marker.dataset.markRead);
    localStorage.setItem(`dreamforum-read-${marker.dataset.thread}`, postId);
    document.querySelectorAll(".post.read-marker").forEach((post) => post.classList.remove("read-marker"));
    document.querySelector(`#post-${postId}`)?.classList.add("read-marker");
    live.textContent = `Beitrag ${postId} als Leseposition gespeichert`;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-board-filter] select, [data-user-filter] select")) event.target.form.requestSubmit();
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-search-form]")) {
    event.preventDefault();
    setRoute("/search", { q: new FormData(event.target).get("q") });
  }
  if (event.target.matches("[data-board-filter]")) {
    event.preventDefault();
    const values = new FormData(event.target);
    setRoute(`/board/${event.target.dataset.boardId}`, { q: values.get("q"), sort: values.get("sort") });
  }
  if (event.target.matches("[data-user-filter]")) {
    event.preventDefault();
    const values = new FormData(event.target);
    setRoute("/users", { q: values.get("q"), sort: values.get("sort") });
  }
});

async function init() {
  try {
    archive = await getJson("data/index.json");
    boardsById = new Map(archive.boards.map((item) => [item.boardID, item]));
    usersById = new Map(archive.users.map((item) => [item.userID, item]));
    threadsById = new Map(archive.threads.map((item) => [item.threadID, item]));
    extras = await getJson("data/extras.json");
    await render();
  } catch (error) {
    renderError("Archivdaten fehlen", error.message);
  }
}

window.addEventListener("hashchange", render);
init();
