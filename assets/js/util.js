/* KATHALATHHA — shared helpers. Plain JavaScript, no libraries, no tracking. */
(function () {
  "use strict";
  var KL = (window.KL = {});

  /* ---------- Text safety ---------- */
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  KL.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };

  /* Language marker inside any text field:  [[or: ଟେକ୍ସଟ]]  ->  <span lang="or">…</span> */
  var LANG_SPAN = /\[\[([A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*):\s*([^\]]+?)\]\]/g;
  KL.lite = function (s) {
    return KL.esc(s).replace(LANG_SPAN, function (_, l, t) {
      return '<span lang="' + l + '">' + t + "</span>";
    });
  };
  KL.stripMarks = function (s) {
    return String(s == null ? "" : s).replace(LANG_SPAN, "$2");
  };

  /* ---------- Search normalisation ----------
     Lower-case, remove Latin accents only (U+0300–036F), and ignore invisible
     joiners. Odia combining signs live in a different Unicode block and are
     never removed, so Odia words are matched exactly as typed. */
  KL.norm = function (s) {
    return String(s == null ? "" : s)
      .normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC")
      .replace(/[​‌‍⁠﻿]/g, "")
      .toLowerCase();
  };

  /* ---------- Labels (edit data/collections.json to change language names) ---------- */
  KL.FORMATS = {
    photograph: "Photograph", audio: "Audio", video: "Video", document: "Document",
    text: "Text", manuscript: "Manuscript", publication: "Publication", other: "Other"
  };
  KL.STATUS = {
    "sample": "Sample entry",
    "verified": "Verified",
    "awaiting-verification": "Awaiting verification",
    "community-account": "Community account",
    "contested": "Contested"
  };
  KL.RIGHTS = {
    "cleared-open": "Cleared (open)",
    "cleared-restricted": "Cleared (restricted)",
    "pending": "Pending",
    "not-cleared": "Not cleared"
  };
  KL.langNames = { en: "English", or: "Odia script", hi: "Hindi" };
  KL.formatLabel = function (f) { return KL.FORMATS[f] || (f ? String(f) : "Other"); };
  KL.langLabel = function (c) { return KL.langNames[c] || c; };

  /* ---------- Loading ---------- */
  KL.fetchJSON = function (url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) { throw new Error("Could not load " + url + " (" + r.status + ")"); }
      return r.json().catch(function (e) {
        throw new Error("The file " + url + " is not valid JSON: " + e.message);
      });
    });
  };
  var textCache = {};
  KL.fetchText = function (url) {
    if (!textCache[url]) {
      textCache[url] = fetch(url, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) { throw new Error("Could not load " + url + " (" + r.status + ")"); }
        return r.text();
      });
    }
    return textCache[url];
  };

  var allPromise = null;
  /* Loads data/collections.json and every collection file it lists. */
  KL.loadAll = function () {
    if (allPromise) { return allPromise; }
    allPromise = KL.fetchJSON("data/collections.json").then(function (index) {
      if (index.languages) {
        Object.keys(index.languages).forEach(function (k) { KL.langNames[k] = index.languages[k]; });
      }
      var problems = [];
      var jobs = (index.collections || []).map(function (c) {
        return KL.fetchJSON(c.file).then(function (d) {
          return (d.items || []).map(function (it) {
            it._c = c.id; it._ctitle = c.title; it._cpage = c.page;
            return it;
          });
        }).catch(function (e) { problems.push(e.message); return []; });
      });
      return Promise.all(jobs).then(function (lists) {
        var items = [].concat.apply([], lists);
        return { index: index, collections: index.collections || [], items: items, problems: problems };
      });
    });
    return allPromise;
  };

  KL.loadArticles = function () {
    return KL.fetchJSON("data/articles.json").then(function (d) {
      var list = (d.articles || []).slice();
      list.sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
      if (d.categories) { KL.articleCategories = d.categories; }
      return list;
    });
  };

  KL.failMessage = function (err) {
    var local = location.protocol === "file:";
    return '<div class="notice"><p><strong>The archive data could not be loaded.</strong></p><p>' +
      (local
        ? "This page was opened directly from a folder. Browsers block data files in that case. It works normally once the site is published on GitHub Pages, or when previewed with the method in the editing guide."
        : "Please check that the JSON files in the <code>data</code> folder are valid, then reload the page.") +
      '</p><p class="small">Technical detail: ' + KL.esc(err && err.message ? err.message : err) + "</p></div>";
  };

  /* ---------- Small renderers ---------- */
  KL.paras = function (text) {
    return String(text || "").split(/\n\s*\n/).map(function (p) { return p.trim(); })
      .filter(Boolean).map(function (p) { return "<p>" + KL.lite(p) + "</p>"; }).join("");
  };
  KL.shorten = function (s, n) {
    s = KL.stripMarks(s).replace(/\s+/g, " ").trim();
    if (s.length <= n) { return s; }
    var cut = s.slice(0, n), sp = cut.lastIndexOf(" ");
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut) + "…";
  };
  KL.formatDate = function (d) {
    if (!d) { return ""; }
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (!m) { return d; }
    var dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (isNaN(dt)) { return d; }
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  };
  KL.itemUrl = function (it) {
    return "item.html?c=" + encodeURIComponent(it._c) + "&id=" + encodeURIComponent(it.id);
  };
  KL.articleUrl = function (a) { return "article.html?id=" + encodeURIComponent(a.id); };

  /* ---------- Minimal, safe Markdown for articles ----------
     Supported: ## headings, paragraphs, - lists, 1. lists, > quotes, ---,
     **bold**, *italic*, [text](link), ![alt text](image), [[or: Odia text]].
     Raw HTML is never allowed. Links may only be http(s), mailto or relative. */
  function safeUrl(u) { return /^(https?:|mailto:|#)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u); }
  KL.inline = function (raw) {
    var s = KL.esc(raw);
    s = s.replace(LANG_SPAN, function (_, l, t) { return '<span lang="' + l + '">' + t + "</span>"; });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, a, u) {
      return safeUrl(u) ? '<img src="' + u + '" alt="' + a + '" loading="lazy">' : "";
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
      return safeUrl(u) ? '<a href="' + u + '">' + t + "</a>" : t;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
    return s;
  };
  KL.md = function (src) {
    var lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
    var out = [], i = 0, m;
    function para(buf) { if (buf.length) { out.push("<p>" + KL.inline(buf.join(" ")) + "</p>"); } }
    var buf = [];
    while (i < lines.length) {
      var ln = lines[i];
      if (/^\s*$/.test(ln)) { para(buf); buf = []; i++; continue; }
      if ((m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(ln))) {
        para(buf); buf = [];
        var lvl = m[1].length <= 2 ? 2 : (m[1].length === 3 ? 3 : 4);
        out.push("<h" + lvl + ">" + KL.inline(m[2]) + "</h" + lvl + ">"); i++; continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(ln)) { para(buf); buf = []; out.push("<hr>"); i++; continue; }
      if (/^\s*>\s?/.test(ln)) {
        para(buf); buf = [];
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out.push("<blockquote><p>" + KL.inline(q.join(" ")) + "</p></blockquote>"); continue;
      }
      if (/^\s*[-*]\s+/.test(ln)) {
        para(buf); buf = [];
        var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { ul.push("<li>" + KL.inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>"); i++; }
        out.push("<ul>" + ul.join("") + "</ul>"); continue;
      }
      if (/^\s*\d+[.)]\s+/.test(ln)) {
        para(buf); buf = [];
        var ol = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { ol.push("<li>" + KL.inline(lines[i].replace(/^\s*\d+[.)]\s+/, "")) + "</li>"); i++; }
        out.push("<ol>" + ol.join("") + "</ol>"); continue;
      }
      buf.push(ln.trim()); i++;
    }
    para(buf);
    return out.join("\n");
  };
})();
