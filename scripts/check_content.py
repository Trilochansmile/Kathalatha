#!/usr/bin/env python3
"""Checks the KATHALATHHA site: JSON data files, file paths, accessibility fields and internal links.
Runs automatically on GitHub (see .github/workflows/check-content.yml). Exit code 1 = problems that must be fixed."""
import json, os, re, sys, glob
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
errors, warnings = [], []
def err(m): errors.append(m)
def warn(m): warnings.append(m)
def load(path):
    try:
        with open(os.path.join(ROOT, path), encoding="utf-8") as f: return json.load(f)
    except FileNotFoundError: err(f"{path}: file not found"); return None
    except json.JSONDecodeError as e: err(f"{path}: not valid JSON (line {e.lineno}, column {e.colno}): {e.msg}. Check for a missing comma or quotation mark."); return None
def exists(ref): return os.path.exists(os.path.join(ROOT, ref))

FILE_FIELDS = ["image","video_poster","audio","video","captions","document","text_file","text_english_file","transcript_file","transcript_english_file"]
ID_OK = re.compile(r"^[a-z0-9][a-z0-9-]*$")
FORMATS = {"photograph","audio","video","document","text","manuscript","publication","other"}
STATUS = {"sample","verified","awaiting-verification","community-account","contested"}
RIGHTS = {"cleared-open","cleared-restricted","pending","not-cleared"}

idx = load("data/collections.json")
if idx:
    seen_pages = set()
    for c in idx.get("collections", []):
        for k in ("id","title","page","file"):
            if not c.get(k): err(f"data/collections.json: a collection is missing '{k}'")
        if c.get("page") and not exists(c["page"]): err(f"data/collections.json: page {c['page']} not found")
        d = load(c.get("file","")) if c.get("file") else None
        if not d: continue
        ids = set()
        for n, it in enumerate(d.get("items", []), 1):
            where = f"{c['file']} entry {n} ({it.get('id','no id')})"
            for k in ("id","title","format","status"):
                if not it.get(k): err(f"{where}: missing '{k}'")
            i = it.get("id","")
            if i and not ID_OK.match(i): err(f"{where}: id must use only lowercase letters, numbers and hyphens")
            if i in ids: err(f"{where}: id used twice in this file")
            ids.add(i)
            if it.get("format") and it["format"] not in FORMATS: warn(f"{where}: unknown format '{it['format']}'")
            if it.get("status") and it["status"] not in STATUS: warn(f"{where}: unknown status '{it['status']}'")
            if it.get("rights_status") and it["rights_status"] not in RIGHTS: warn(f"{where}: unknown rights_status '{it['rights_status']}'")
            for f in FILE_FIELDS:
                if it.get(f) and not exists(it[f]): err(f"{where}: file '{it[f]}' ({f}) not found. Check the name and the folder.")
            if it.get("image") and not it.get("image_alt"): err(f"{where}: image has no 'image_alt' (description for screen readers)")
            if it.get("format") == "photograph" and not it.get("accessibility_description") and it.get("status") != "sample": warn(f"{where}: photograph without 'accessibility_description'")
            has_tr = any(it.get(k) for k in ("transcript","transcript_file"))
            if (it.get("audio") or it.get("video")) and not has_tr: warn(f"{where}: audio/video without a transcript")
            if it.get("video") and not it.get("captions"): warn(f"{where}: video without captions")
            if it.get("status") != "sample" and it.get("rights_status") in ("pending","not-cleared"): warn(f"{where}: rights are '{it.get('rights_status')}'. Publish only once rights and consent are settled")
            if it.get("status") != "sample" and not it.get("source"): warn(f"{where}: no 'source'")

arts = load("data/articles.json")
if arts:
    ids = set()
    for a in arts.get("articles", []):
        where = f"data/articles.json article {a.get('id','no id')}"
        for k in ("id","title","file","category","date"):
            if not a.get(k): err(f"{where}: missing '{k}'")
        if a.get("id") in ids: err(f"{where}: id used twice")
        ids.add(a.get("id"))
        if a.get("id") and not ID_OK.match(a["id"]): err(f"{where}: id must use only lowercase letters, numbers and hyphens")
        if a.get("file") and not exists(a["file"]): err(f"{where}: article file '{a['file']}' not found")
        if a.get("image") and not exists(a["image"]): err(f"{where}: image '{a['image']}' not found")
        if a.get("image") and not a.get("image_alt"): err(f"{where}: image without 'image_alt'")
        if a.get("date") and not re.match(r"^\d{4}-\d{2}-\d{2}$", a["date"]): warn(f"{where}: date should look like 2026-03-15")
        if a.get("file") and exists(a["file"]):
            body = open(os.path.join(ROOT, a["file"]), encoding="utf-8").read()
            for m in re.finditer(r"!\[([^\]]*)\]\(([^)\s]+)\)", body):
                if not m.group(1).strip(): warn(f"{a['file']}: picture {m.group(2)} has no description in the square brackets")
                if not re.match(r"^(https?:|/)", m.group(2)) and not exists(m.group(2)): err(f"{a['file']}: picture '{m.group(2)}' not found")

class P(HTMLParser):
    def __init__(s): super().__init__(); s.refs=[]; s.ids=set(); s.h1=0; s.imgs=[]; s.title=False; s.has_title=False; s.lang=None
    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if "id" in a: s.ids.add(a["id"])
        if tag=="html": s.lang=a.get("lang")
        if tag=="h1": s.h1+=1
        if tag=="title": s.title=True
        for k in ("href","src"):
            if k in a and tag in ("a","link","script","img","audio","video","source","track"): s.refs.append(a[k])
        if tag=="img" and "alt" not in a: s.imgs.append(a.get("src"))
        if tag=="meta" and a.get("name")=="viewport" and "user-scalable=no" in a.get("content",""): err("viewport blocks zooming")
    def handle_data(s, d):
        if s.title and d.strip(): s.has_title=True
    def handle_endtag(s, tag):
        if tag=="title": s.title=False

pages = [p for p in glob.glob(os.path.join(ROOT,"**/*.html"), recursive=True)]
parsed = {}
for p in pages:
    pp = P(); pp.feed(open(p,encoding="utf-8").read()); parsed[os.path.abspath(p)] = pp
for p, pp in parsed.items():
    rel = os.path.relpath(p, ROOT)
    if not pp.lang: err(f"{rel}: <html> has no lang attribute")
    if not pp.has_title: err(f"{rel}: no <title>")
    if pp.h1 > 1: err(f"{rel}: more than one <h1>")
    for s in pp.imgs: err(f"{rel}: image {s} has no alt attribute")
    for ref in pp.refs:
        u = urlparse(ref)
        if u.scheme in ("http","https","mailto","tel","javascript") or ref.startswith("//"): continue
        path = unquote(u.path)
        target = p if not path else os.path.abspath(os.path.join(os.path.dirname(p), path))
        if rel == "404.html" and path: target = os.path.abspath(os.path.join(ROOT, path))
        if not os.path.exists(target): err(f"{rel}: broken link or file path '{ref}'"); continue
        if u.fragment and target.endswith(".html"):
            tp = parsed.get(target)
            if tp and u.fragment not in tp.ids: err(f"{rel}: link '{ref}' points to a section that does not exist")

for w in warnings: print("WARNING:", w)
for e in errors: print("ERROR:  ", e)
print(f"\nChecked {len(pages)} pages and the data files: {len(errors)} errors, {len(warnings)} warnings.")
sys.exit(1 if errors else 0)
