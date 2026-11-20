/* KATHALATHHA — shows one archive record (item.html) or one article (article.html). */
(function () {
  "use strict";
  var KL = window.KL;
  var root = document.getElementById("record");
  if (!root) { return; }
  var params = new URLSearchParams(location.search);
  var SITE = "KATHALATHHA";

  function notFound(what) {
    document.title = what + " not found — " + SITE;
    root.innerHTML = '<h1>' + KL.esc(what) + ' not found</h1><p>We could not find that ' + KL.esc(what.toLowerCase()) +
      '. The link may be old or mistyped.</p><p><a href="' + (what === "Article" ? "articles-and-essays.html" : "digital-collections.html") +
      '">Go to the ' + (what === "Article" ? "articles" : "digital collections") + " page</a></p>";
  }

  function row(label, valueHtml) {
    return valueHtml ? "<div><dt>" + KL.esc(label) + "</dt><dd>" + valueHtml + "</dd></div>" : "";
  }

  function trBlock(label, text, wrapClass) {
    return '<div class="translation-block" lang="en"><p class="label-line">' + KL.esc(label) + "</p>" +
      '<div class="' + (wrapClass || "text-block") + '">' + KL.paras(text) + "</div></div>";
  }

  /* Reads a field that may be written inline (text) or kept in a file (text_file). */
  function fieldText(it, key) {
    if (it[key]) { return Promise.resolve(it[key]); }
    if (it[key + "_file"]) {
      return KL.fetchText(it[key + "_file"]).catch(function () {
        return "(The file " + it[key + "_file"] + " could not be loaded.)";
      });
    }
    return Promise.resolve("");
  }

  /* ------------------------------------------------------------ item page */
  function renderItem(it, coll, tx) {
    var L = it.lang || "en", other = L !== "en";
    var isAudio = it.format === "audio" || it.audio, isVideo = it.format === "video" || it.video;
    var h = '<article class="record">';
    h += '<nav class="crumbs" aria-label="Breadcrumb"><a href="digital-collections.html">Digital Collections</a> › <a href="' +
      KL.esc(coll.page) + '">' + KL.esc(coll.title) + "</a></nav>";
    h += '<ul class="badges">';
    if (it.status === "sample") { h += '<li class="badge badge-sample">Sample entry</li>'; }
    h += '<li class="badge">' + KL.esc(KL.formatLabel(it.format)) + "</li></ul>";
    h += '<h1 lang="' + KL.esc(L) + '">' + KL.lite(it.title) + "</h1>";
    if (it.title_english) {
      h += '<p class="translation" lang="en"><span class="label-line">English title (translation)</span>' + KL.lite(it.title_english) + "</p>";
    }
    if (it.status === "sample") {
      h += '<div class="notice"><p><strong>Sample entry.</strong> This is a placeholder that shows how a record looks. It is not a real archival record and contains no real cultural information. Delete it once you have added your own records.</p></div>';
    }
    if (it.description) {
      h += '<div class="text-block" lang="' + KL.esc(L) + '">' + KL.paras(it.description) + "</div>";
    }
    if (it.description_english) { h += trBlock(other ? "English translation of the description" : "English version", it.description_english); }

    /* Image */
    if (it.image) {
      h += '<figure><img src="' + KL.esc(it.image) + '" alt="' + KL.esc(it.image_alt || it.title) + '">';
      if (it.image_caption) { h += '<figcaption lang="' + KL.esc(L) + '">' + KL.lite(it.image_caption) + "</figcaption>"; }
      h += "</figure>";
    } else if (it.format === "photograph") {
      h += '<div class="notice"><p>No image file is attached to this record yet.</p></div>';
    }
    if (it.accessibility_description) {
      h += "<h2>Accessibility description</h2>" + '<div class="text-block">' + KL.paras(it.accessibility_description) + "</div>";
    }

    /* Audio */
    if (it.audio) {
      h += '<h2>Listen</h2><div class="media-box"><audio controls preload="none" src="' + KL.esc(it.audio) + '">' +
        'Your browser cannot play this audio. <a href="' + KL.esc(it.audio) + '">Download the audio file</a>.</audio></div>';
    } else if (it.format === "audio") {
      h += '<div class="notice"><p>No audio file is attached to this record yet.</p></div>';
    }

    /* Video */
    if (it.video) {
      h += '<h2>Watch</h2><div class="media-box"><video controls preload="metadata"' + (it.video_poster ? ' poster="' + KL.esc(it.video_poster) + '"' : "") + ' src="' + KL.esc(it.video) + '">';
      if (it.captions) {
        var cl = it.captions_lang || L;
        h += '<track kind="captions" src="' + KL.esc(it.captions) + '" srclang="' + KL.esc(cl) + '" label="' + KL.esc(KL.langLabel(cl)) + ' captions" default>';
      }
      h += 'Your browser cannot play this video. <a href="' + KL.esc(it.video) + '">Download the video file</a>.</video></div>';
      if (!it.captions) {
        h += '<div class="notice"><p><strong>Captions are not yet available for this video.</strong> Use the transcript below where one is given.</p></div>';
      }
    } else if (it.format === "video") {
      h += '<div class="notice"><p>No video file is attached to this record yet.</p></div>';
    }

    /* Document / external link */
    if (it.document) {
      var ext = (it.document.split(".").pop() || "file").toUpperCase();
      h += '<p><a class="btn" href="' + KL.esc(it.document) + '">Open the document (' + KL.esc(ext) + ")</a></p>";
    }
    if (it.external_url) {
      h += '<p><a href="' + KL.esc(it.external_url) + '">' + KL.esc(it.external_label || "See this item at its original location") + "</a></p>";
    }

    /* Full text */
    if (tx.text) {
      h += "<h2>" + KL.esc(it.text_heading || "Text") + '</h2><div class="text-block" lang="' + KL.esc(L) + '">' + KL.paras(tx.text) + "</div>";
    }
    if (tx.text_english) { h += trBlock("English translation", tx.text_english); }

    /* Transcript */
    if (tx.transcript) {
      h += '<h2>Transcript</h2><div class="text-block" lang="' + KL.esc(L) + '">' + KL.paras(tx.transcript) + "</div>";
    } else if (isAudio || isVideo) {
      h += '<h2>Transcript</h2><div class="notice"><p>A transcript has not been added to this record yet.</p></div>';
    }
    if (tx.transcript_english) { h += trBlock("English translation of the transcript", tx.transcript_english); }

    /* Record details */
    var rows = "";
    rows += row("Collection", '<a href="' + KL.esc(coll.page) + '">' + KL.esc(coll.title) + "</a>");
    rows += row("Format", KL.esc(KL.formatLabel(it.format)));
    var by = it.creator ? KL.lite(it.creator) + (it.role ? " (" + KL.lite(it.role) + ")" : "") : "";
    rows += row("Creator or contributor", by);
    rows += row("Date", KL.lite(it.date || ""));
    rows += row("Language", KL.esc(KL.langLabel(L)));
    rows += row("Script", KL.lite(it.script || ""));
    rows += row("Place or locality", KL.lite(it.locality || ""));
    rows += row("Subject", KL.lite([].concat(it.subject || []).join(", ")));
    if (it.details && typeof it.details === "object") {
      Object.keys(it.details).forEach(function (k) { rows += row(k, KL.lite(it.details[k])); });
    }
    rows += row("Source", KL.lite(it.source || ""));
    rows += row("Provenance", KL.lite(it.provenance || ""));
    var rs = it.rights_status ? (KL.RIGHTS[it.rights_status] || it.rights_status) : "";
    rows += row("Rights", KL.lite([rs, it.rights].filter(Boolean).join(". ")));
    rows += row("Verification status", KL.esc(KL.STATUS[it.status] || it.status || "Not stated"));
    h += '<h2>About this record</h2><dl class="meta-list">' + rows + "</dl>";
    return h + "</article>";
  }

  function itemPage() {
    var c = params.get("c"), id = params.get("id");
    KL.loadAll().then(function (data) {
      var it = null;
      data.items.some(function (x) { if (x._c === c && x.id === id) { it = x; return true; } return false; });
      if (!it) { notFound("Record"); return; }
      var coll = data.collections.filter(function (x) { return x.id === it._c; })[0];
      return Promise.all(["text", "text_english", "transcript", "transcript_english"].map(function (k) { return fieldText(it, k); }))
        .then(function (v) {
          document.title = KL.stripMarks(it.title) + " — " + SITE;
          root.innerHTML = renderItem(it, coll, { text: v[0], text_english: v[1], transcript: v[2], transcript_english: v[3] });
        });
    }).catch(function (e) { root.innerHTML = KL.failMessage(e); });
  }

  /* --------------------------------------------------------- article page */
  function articlePage() {
    var id = params.get("id");
    KL.loadArticles().then(function (list) {
      var a = list.filter(function (x) { return x.id === id; })[0];
      if (!a) { notFound("Article"); return; }
      var L = a.lang || "en";
      return KL.fetchText(a.file).then(function (md) {
        document.title = KL.stripMarks(a.title) + " — " + SITE;
        var h = '<article><nav class="crumbs" aria-label="Breadcrumb"><a href="articles-and-essays.html">Articles and Essays</a></nav>';
        h += '<ul class="badges">';
        if (a.status === "sample") { h += '<li class="badge badge-sample">Sample entry</li>'; }
        if (a.category) { h += '<li class="badge">' + KL.esc(a.category) + "</li>"; }
        h += '</ul><h1 lang="' + KL.esc(L) + '">' + KL.lite(a.title) + "</h1>";
        if (a.title_english) { h += '<p class="translation" lang="en"><span class="label-line">English title (translation)</span>' + KL.lite(a.title_english) + "</p>"; }
        var by = [];
        if (a.author) { by.push("By " + KL.lite(a.author)); }
        if (a.date) { by.push('<time datetime="' + KL.esc(a.date) + '">' + KL.esc(KL.formatDate(a.date)) + "</time>"); }
        if (by.length) { h += '<p class="byline">' + by.join(" · ") + "</p>"; }
        if (a.status === "sample") {
          h += '<div class="notice"><p><strong>Sample entry.</strong> This placeholder article shows how an article is displayed. It is not real content.</p></div>';
        }
        if (a.image) {
          h += '<figure class="record"><img src="' + KL.esc(a.image) + '" alt="' + KL.esc(a.image_alt || "") + '">' +
            (a.image_caption ? "<figcaption>" + KL.lite(a.image_caption) + "</figcaption>" : "") + "</figure>";
        }
        h += '<div class="article-body" lang="' + KL.esc(L) + '">' + KL.md(md) + "</div></article>";
        root.innerHTML = h;
      });
    }).catch(function (e) { root.innerHTML = KL.failMessage(e); });
  }

  if (root.getAttribute("data-kind") === "article") { articlePage(); } else { itemPage(); }
})();
