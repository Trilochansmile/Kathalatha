/* Entry helper: builds a JSON entry from a form, and checks pasted JSON. Runs only in the browser. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var FIELDS = ["title", "title_english", "format", "lang", "status", "description", "creator", "role", "date",
    "locality", "source", "rights_status", "rights", "image", "image_alt", "audio", "video", "captions",
    "transcript_file", "text_file", "accessibility_description"];
  function slug(s) {
    var t = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return t || "entry-" + Date.now().toString(36);
  }
  $("make").addEventListener("submit", function (e) {
    e.preventDefault();
    var coll = $("f-coll").value, o = {};
    var title = $("f-title").value.trim();
    o.id = slug(title.match(/[A-Za-z0-9]/) ? title : "");
    FIELDS.forEach(function (f) {
      var v = $("f-" + f).value.trim();
      if (v) { o[f] = v; }
    });
    if (coll === "article") {
      o = { id: o.id, status: o.status, title: o.title, title_english: o.title_english, lang: o.lang, author: o.creator,
        date: o.date, category: "Essay", summary: o.description, file: "articles/" + o.id + ".md" };
      Object.keys(o).forEach(function (k) { if (!o[k]) { delete o[k]; } });
    }
    var json = JSON.stringify(o, null, 2);
    $("out").value = json;
    $("made").hidden = false;
    $("copied").textContent = coll === "article"
      ? "Remember to create the article text file: articles/" + o.id + ".md"
      : "";
    $("out").focus();
  });
  $("copy").addEventListener("click", function () {
    var out = $("out"); out.select();
    var done = function () { $("copied").textContent = "Copied."; };
    if (navigator.clipboard) { navigator.clipboard.writeText(out.value).then(done, function () { document.execCommand("copy"); done(); }); }
    else { document.execCommand("copy"); done(); }
  });
  $("check").addEventListener("click", function () {
    var src = $("chk").value, out = $("chk-out");
    try {
      var d = JSON.parse(src);
      var n = (d.items || d.articles || []).length;
      var ids = {}, dup = [];
      (d.items || d.articles || []).forEach(function (x) { if (ids[x.id]) { dup.push(x.id); } ids[x.id] = 1; });
      out.textContent = dup.length
        ? "The file is valid JSON, but these ids appear twice: " + dup.join(", ") + ". Every id must be different."
        : "The file is valid. It contains " + n + " entries.";
    } catch (err) {
      var m = /position (\d+)/.exec(err.message), where = "";
      if (m) {
        var pos = +m[1], before = src.slice(0, pos).split("\n");
        where = " Look near line " + before.length + ", column " + (before[before.length - 1].length + 1) + ".";
      }
      out.textContent = "There is a mistake in the file: " + err.message + "." + where + " Usual causes: a missing comma between two entries, a comma after the last entry, or a missing quotation mark.";
    }
  });
})();
