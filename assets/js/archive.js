/* KATHALATHHA — browsing and searching the collections and articles.
   Everything runs in the visitor's browser. Nothing is sent anywhere. */
(function () {
  "use strict";
  var KL = window.KL;
  var PAGE = 12;

  function $(id) { return document.getElementById(id); }

  /* ---------- Cards ---------- */
  function itemCard(it, showCollection) {
    var L = it.lang || "en";
    var h = '<li class="card"><h3 lang="' + KL.esc(L) + '"><a href="' + KL.esc(KL.itemUrl(it)) + '">' + KL.lite(it.title) + "</a></h3>";
    h += '<ul class="badges">';
    if (it.status === "sample") { h += '<li class="badge badge-sample">Sample entry</li>'; }
    h += '<li class="badge">' + KL.esc(KL.formatLabel(it.format)) + "</li>";
    if (showCollection) { h += '<li class="badge">' + KL.esc(it._ctitle) + "</li>"; }
    h += "</ul>";
    if (it.image && it.format === "photograph") {
      h += '<img class="thumb" src="' + KL.esc(it.image) + '" alt="" loading="lazy">';
    }
    if (it.description) { h += '<p lang="' + KL.esc(L) + '">' + KL.lite(KL.shorten(it.description, 200)) + "</p>"; }
    var meta = [];
    if (it.creator) { meta.push(KL.lite(it.creator)); }
    if (it.date) { meta.push(KL.lite(it.date)); }
    if (meta.length) { h += '<p class="meta">' + meta.join(" · ") + "</p>"; }
    return h + "</li>";
  }

  function articleCard(a) {
    var L = a.lang || "en";
    var h = '<li class="card"><h3 lang="' + KL.esc(L) + '"><a href="' + KL.esc(KL.articleUrl(a)) + '">' + KL.lite(a.title) + "</a></h3>";
    h += '<ul class="badges">';
    if (a.status === "sample") { h += '<li class="badge badge-sample">Sample entry</li>'; }
    if (a.category) { h += '<li class="badge">' + KL.esc(a.category) + "</li>"; }
    h += "</ul>";
    if (a.summary) { h += '<p lang="' + KL.esc(L) + '">' + KL.lite(KL.shorten(a.summary, 220)) + "</p>"; }
    var meta = [];
    if (a.author) { meta.push(KL.lite(a.author)); }
    if (a.date) { meta.push(KL.esc(KL.formatDate(a.date))); }
    if (meta.length) { h += '<p class="meta">' + meta.join(" · ") + "</p>"; }
    return h + "</li>";
  }

  /* ---------- Search index ---------- */
  function flat(v) {
    if (v == null) { return ""; }
    if (Array.isArray(v)) { return v.map(flat).join(" "); }
    if (typeof v === "object") { return Object.keys(v).map(function (k) { return k + " " + flat(v[k]); }).join(" "); }
    return String(v);
  }
  var INLINE_FIELDS = ["title", "title_english", "description", "description_english", "creator", "role",
    "date", "locality", "subject", "keywords", "source", "provenance", "rights", "details", "format",
    "text", "text_english", "transcript", "transcript_english", "accessibility_description", "image_caption"];
  var FILE_FIELDS = ["text", "text_english", "transcript", "transcript_english"];

  function buildIndex(it) {
    it._title = KL.norm(KL.stripMarks(it.title + " " + (it.title_english || "")));
    it._blob = KL.norm(KL.stripMarks(INLINE_FIELDS.map(function (f) { return flat(it[f]); }).join(" ") + " " + (it._ctitle || "")));
  }
  var fullTextLoaded = false;
  function loadFullTexts(items) {
    if (fullTextLoaded) { return Promise.resolve(); }
    var jobs = [];
    items.forEach(function (it) {
      FILE_FIELDS.forEach(function (f) {
        if (!it[f] && it[f + "_file"]) {
          jobs.push(KL.fetchText(it[f + "_file"]).then(function (t) {
            it._blob += " " + KL.norm(KL.stripMarks(t));
          }).catch(function () {}));
        }
      });
    });
    return Promise.all(jobs).then(function () { fullTextLoaded = true; });
  }

  function select(id, label, options, value) {
    var h = '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '" name="' + id + '">';
    options.forEach(function (o) {
      h += '<option value="' + KL.esc(o[0]) + '"' + (o[0] === value ? " selected" : "") + ">" + KL.esc(o[1]) + "</option>";
    });
    return h + "</select></div>";
  }

  /* ---------- Collection browser (section pages and Digital Collections) ---------- */
  function initBrowser(root) {
    var scope = root.getAttribute("data-collection") || "all";
    root.innerHTML = '<p class="status" role="status">Loading records…</p>';
    KL.loadAll().then(function (data) {
      var items = data.items.filter(function (it) { return scope === "all" || it._c === scope; });
      items.forEach(buildIndex);
      var params = new URLSearchParams(location.search);

      var formats = {}, langs = {};
      items.forEach(function (it) { formats[it.format || "other"] = 1; langs[it.lang || "en"] = 1; });
      var fOpts = [["", "All formats"]].concat(Object.keys(formats).sort().map(function (f) { return [f, KL.formatLabel(f)]; }));
      var lOpts = [["", "All languages"]].concat(Object.keys(langs).sort().map(function (l) { return [l, KL.langLabel(l)]; }));
      var cOpts = [["", "All collections"]].concat(data.collections.map(function (c) { return [c.id, c.title]; }));

      var h = '<div class="search-panel"><form role="search" aria-label="Search ' + (scope === "all" ? "the digital collections" : "this section") + '" id="kl-form" novalidate>' +
        '<div class="field field-wide"><label for="q">Search</label>' +
        '<span class="hint" id="q-hint">Type words from a title, description, creator, subject or transcript. All the words you type must match.</span>' +
        '<input type="search" id="q" name="q" autocomplete="off" aria-describedby="q-hint" value="' + KL.esc(params.get("q") || "") + '"></div>';
      if (scope === "all") { h += select("c", "Collection", cOpts, params.get("c") || ""); }
      h += select("f", "Format", fOpts, params.get("f") || "") + select("l", "Language of the item", lOpts, params.get("l") || "");
      h += '<div class="form-actions field-wide"><button type="submit" class="btn">Search</button>' +
        '<button type="button" class="btn btn-secondary" id="kl-clear">Clear search and filters</button></div></form></div>' +
        '<p class="status" role="status" id="kl-status"></p><ul class="results" id="kl-results"></ul>' +
        '<div class="load-more" id="kl-more"></div>';
      root.innerHTML = h;
      if (data.problems.length) {
        root.insertAdjacentHTML("afterbegin", '<div class="notice"><p><strong>Some collection files could not be loaded:</strong></p><ul>' +
          data.problems.map(function (p) { return "<li>" + KL.esc(p) + "</li>"; }).join("") + "</ul></div>");
      }

      var form = $("kl-form"), results = $("kl-results"), status = $("kl-status"), more = $("kl-more");
      var matches = [], shown = 0;

      function currentState() {
        return { q: $("q").value.trim(), c: $("c") ? $("c").value : "", f: $("f").value, l: $("l").value };
      }

      function paint(append) {
        var from = append ? shown : 0;
        var to = Math.min(matches.length, from + PAGE);
        var html = matches.slice(from, to).map(function (it) { return itemCard(it, scope === "all"); }).join("");
        if (append) { results.insertAdjacentHTML("beforeend", html); } else { results.innerHTML = html; }
        shown = to;
        if (shown < matches.length) {
          more.innerHTML = '<button type="button" class="btn btn-secondary" id="kl-more-btn">Show more records (' + shown + " of " + matches.length + " shown)</button>";
          $("kl-more-btn").addEventListener("click", function () {
            var firstNew = shown;
            paint(true);
            var link = results.querySelectorAll("li.card h3 a")[firstNew];
            if (link) { link.focus(); }
          });
        } else { more.innerHTML = ""; }
      }

      function announce(st) {
        var n = matches.length;
        var msg;
        if (!n) {
          msg = "No records match your search. Try fewer words, or clear the filters.";
        } else {
          msg = n + (n === 1 ? " record" : " records") + (st.q ? " found for “" + st.q + "”" : (st.c || st.f || st.l ? (n === 1 ? " matches the filters" : " match the filters") : (n === 1 ? " in the archive" : " in the archive"))) + ".";
        }
        status.textContent = msg;
      }

      function run(updateUrl) {
        var st = currentState();
        var tokens = KL.norm(st.q).split(/\s+/).filter(Boolean);
        var go = function () {
          matches = items.filter(function (it) {
            if (st.c && it._c !== st.c) { return false; }
            if (st.f && (it.format || "other") !== st.f) { return false; }
            if (st.l && (it.lang || "en") !== st.l) { return false; }
            return tokens.every(function (t) { return it._blob.indexOf(t) !== -1; });
          });
          if (tokens.length) {
            matches.forEach(function (it) {
              it._score = tokens.reduce(function (s, t) { return s + (it._title.indexOf(t) !== -1 ? 3 : 1); }, 0);
            });
            matches = matches.map(function (it, i) { return [it, i]; })
              .sort(function (a, b) { return (b[0]._score - a[0]._score) || (a[1] - b[1]); })
              .map(function (p) { return p[0]; });
          }
          paint(false);
          announce(st);
        };
        if (tokens.length && !fullTextLoaded) {
          status.textContent = "Searching…";
          loadFullTexts(items).then(go);
        } else { go(); }
        if (updateUrl && window.history && history.replaceState) {
          var p = new URLSearchParams();
          if (st.q) { p.set("q", st.q); }
          if (st.c) { p.set("c", st.c); }
          if (st.f) { p.set("f", st.f); }
          if (st.l) { p.set("l", st.l); }
          var qs = p.toString();
          history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
        }
      }

      form.addEventListener("submit", function (e) { e.preventDefault(); run(true); });
      ["c", "f", "l"].forEach(function (id) { if ($(id)) { $(id).addEventListener("change", function () { run(true); }); } });
      $("kl-clear").addEventListener("click", function () {
        $("q").value = ""; if ($("c")) { $("c").value = ""; } $("f").value = ""; $("l").value = "";
        run(true);
        $("q").focus();
      });
      run(false);
    }).catch(function (e) { root.innerHTML = KL.failMessage(e); });
  }

  /* ---------- Overview cards of the collections ---------- */
  function initCollectionCards(root) {
    KL.loadAll().then(function (data) {
      var counts = {};
      data.items.forEach(function (it) { counts[it._c] = (counts[it._c] || 0) + 1; });
      root.innerHTML = data.collections.map(function (c) {
        var n = counts[c.id] || 0;
        return '<li class="card"><h3><a href="' + KL.esc(c.page) + '">' + KL.esc(c.title) + "</a></h3><p>" + KL.esc(c.description || "") +
          '</p><p class="count">' + n + (n === 1 ? " record" : " records") + "</p></li>";
      }).join("");
    }).catch(function (e) { root.outerHTML = KL.failMessage(e); });
  }

  /* ---------- Home page: featured items ---------- */
  function initFeatured(section) {
    KL.loadAll().then(function (data) {
      var feat = data.items.filter(function (it) { return it.featured; }).slice(0, 6);
      if (!feat.length) { return; }
      section.querySelector("ul").innerHTML = feat.map(function (it) { return itemCard(it, true); }).join("");
      section.hidden = false;
    }).catch(function () { /* leave the section hidden */ });
  }

  /* ---------- Articles ---------- */
  function initRecentArticles(section) {
    KL.loadArticles().then(function (list) {
      if (!list.length) { return; }
      section.querySelector("ul").innerHTML = list.slice(0, 3).map(articleCard).join("");
      section.hidden = false;
    }).catch(function () {});
  }

  function initArticleBrowser(root) {
    root.innerHTML = '<p class="status" role="status">Loading articles…</p>';
    KL.loadArticles().then(function (list) {
      var cats = {};
      list.forEach(function (a) { if (a.category) { cats[a.category] = 1; } });
      var catList = (KL.articleCategories || []).filter(function (c) { return cats[c]; });
      Object.keys(cats).forEach(function (c) { if (catList.indexOf(c) === -1) { catList.push(c); } });
      var params = new URLSearchParams(location.search);
      var h = '<div class="search-panel"><form role="search" aria-label="Search articles and essays" id="ar-form" novalidate>' +
        '<div class="field"><label for="aq">Search articles</label><input type="search" id="aq" autocomplete="off" value="' + KL.esc(params.get("q") || "") + '"></div>' +
        select("ac", "Type of article", [["", "All types"]].concat(catList.map(function (c) { return [c, c]; })), params.get("t") || "") +
        '<div class="form-actions"><button type="submit" class="btn">Search</button>' +
        '<button type="button" class="btn btn-secondary" id="ar-clear">Clear</button></div></form></div>' +
        '<p class="status" role="status" id="ar-status"></p><ul class="results" id="ar-results"></ul>';
      root.innerHTML = h;
      list.forEach(function (a) {
        a._blob = KL.norm(KL.stripMarks([a.title, a.title_english, a.author, a.category, a.summary, flat(a.keywords)].join(" ")));
      });
      function run() {
        var tokens = KL.norm($("aq").value).split(/\s+/).filter(Boolean), cat = $("ac").value;
        var m = list.filter(function (a) {
          return (!cat || a.category === cat) && tokens.every(function (t) { return a._blob.indexOf(t) !== -1; });
        });
        $("ar-results").innerHTML = m.map(articleCard).join("");
        $("ar-status").textContent = m.length ? m.length + (m.length === 1 ? " article" : " articles") + "." : "No articles match. Try fewer words or clear the search.";
      }
      $("ar-form").addEventListener("submit", function (e) { e.preventDefault(); run(); });
      $("ac").addEventListener("change", run);
      $("ar-clear").addEventListener("click", function () { $("aq").value = ""; $("ac").value = ""; run(); $("aq").focus(); });
      run();
    }).catch(function (e) { root.innerHTML = KL.failMessage(e); });
  }

  var el;
  if ((el = $("browser"))) { initBrowser(el); }
  if ((el = $("collection-cards"))) { initCollectionCards(el); }
  if ((el = $("featured"))) { initFeatured(el); }
  if ((el = $("recent-articles"))) { initRecentArticles(el); }
  if ((el = $("article-browser"))) { initArticleBrowser(el); }
})();
