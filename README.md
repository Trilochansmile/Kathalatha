# KATHALATHHA (କଥାଲଥା) — The Kosli Digital Archive

A complete static website: plain HTML, CSS and JavaScript, with the records kept in JSON files.
No PHP, no WordPress, no database, no server. It is built to be hosted free on **GitHub Pages**.

Design: Soft Lilac `#E8DDF2`, Lavender Ivory `#F8F3FA`, Deep Plum `#39264D`, Muted Lavender `#B69ACF`
(decoration only, because it is too pale for text), set in EB Garamond.

## What is in the folder

| Path | What it is |
|---|---|
| `index.html` and ten other `.html` pages | Home, Kosli Language, Literature, Folklore and Oral Traditions, Music and Performance, History and Heritage, People and Personalities, Digital Collections, Articles and Essays, About, Contact |
| `item.html`, `article.html` | Show one record or one article (filled in from the data files) |
| `404.html` | "Page not found" page, used automatically by GitHub Pages |
| `data/` | **The content.** One JSON file per collection, plus `articles.json` and `collections.json` |
| `articles/` | The text of each article, one `.md` file per article |
| `media/` | Your photographs, audio, video, captions, documents and long texts |
| `assets/` | Stylesheet, JavaScript, fonts, favicon (you do not need to touch these) |
| `tools/entry-helper.html` | A form that writes a record for you, and a checker for mistakes |
| `docs/CONTENT-GUIDE.md` | **How to add articles, photographs, songs, stories and records** |
| `docs/ACCESSIBILITY-CHECKLIST.md` | Tests to run before you announce the site |
| `screenshots/` | Preview images of the main pages (desktop and phone) |
| `scripts/check_content.py` and `.github/` | An automatic checker that runs on GitHub when you save changes |

## Publish it with GitHub Pages (about 10 minutes)

1. Create a free account at <https://github.com> if you do not have one.
2. Click **+** (top right) → **New repository**. Name it, for example, `kathalatha`. Choose **Public** (free GitHub Pages needs a public repository on a free account). Click **Create repository**.
3. On the new repository page click **uploading an existing file**. Unzip this project on your computer, open the unzipped folder, select **everything inside it** (including the hidden `.github` folder and the `.nojekyll` file if your system shows them) and drag it into the browser. Wait for the upload bars, then click **Commit changes**.
   * If the drag-and-drop skips the hidden `.github` folder or `.nojekyll`, the site still works. The `.nojekyll` file only switches off a GitHub feature the site does not need, and `.github` only holds the optional automatic checker.
   * `index.html` must end up at the top level of the repository, not inside another folder.
4. Go to **Settings → Pages**. Under **Build and deployment → Source** choose **Deploy from a branch**. Under **Branch** choose `main` and the folder `/ (root)`, then **Save**.
5. Wait one to two minutes and refresh the page. GitHub shows your address: `https://YOUR-USERNAME.github.io/kathalatha/`.

Every time you save a change in the repository, the site updates by itself after a minute or two.

**Your own domain (optional).** In **Settings → Pages → Custom domain**, type the domain and follow GitHub's instructions. Tick **Enforce HTTPS**.

**Username site.** If you name the repository `YOUR-USERNAME.github.io`, the site lives at the top of that address. Then open `404.html`, find `var override = null;` and change it to `var override = "/";`.

## Before you announce the site

1. Replace the placeholder email in `contact.html` (see the guide) and delete the "Sample text" notices in `about.html` and `contact.html`.
2. Write your own text in About.
3. Replace the sample records (see the guide, "Removing the sample content"), and delete the two "Sample content" notices on the Home and Digital Collections pages.
4. Work through `docs/ACCESSIBILITY-CHECKLIST.md`.

## Seeing the site on your own computer (optional)

Browsers do not let a page read its data files when you double-click it, so the record lists will show a message. To preview locally you need a tiny local web server; the easiest way is to publish to GitHub Pages and look at the live address, which is what the guide assumes. (If you have Python: open a terminal in the folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000`.)

## Limits and honest notes

* **No made-up content.** There are no real records in the project. The six "Sample entry" records and one sample article are clearly marked placeholders containing no Kosli words, translations or cultural information. The words on the pages are only your own project text (the purpose statement and tagline) and descriptions of what each section is for.
* **Odia and Kosli text.** EB Garamond contains no Odia script, so Odia text is shown in a font already on the visitor's device (Noto, Nirmala UI, Kohinoor Odia, Oriya Sangam MN and others are tried in turn). Modern Windows, macOS, iOS and Android have one. If you want to guarantee the same Odia letter shapes everywhere, add an Odia web font file (for example Noto Sans Oriya, free under the SIL Open Font License) to `assets/fonts/` and name it in the `--font` line at the top of `assets/css/style.css`.
* **Language code for Kosli.** Screen readers choose a voice from the language code. Records default to `or` (Odia). I could not verify the correct code for Kosli, so check this with Kosli speakers and the language registries (as your WordPress notes already advised) before relying on it. The code can be set per record (`"lang"`) and the display names in `data/collections.json`.
* **Not yet tested with assistive technology.** The site was built to WCAG 2.2 AA and checked automatically for structure, links and keyboard order in a browser, but it has not been tested with NVDA, JAWS or VoiceOver, or by disabled users. Do not claim conformance until you have done that (the checklist helps).
* **Fonts.** EB Garamond is included and served from the site itself (SIL Open Font License, see `assets/fonts/EBGaramond-OFL.txt`), so visitors make no request to Google. Your WordPress plan also used Atkinson Hyperlegible for menus and forms; as you asked for EB Garamond, the whole site uses it.
* **Contact.** There is no contact form, because a form needs a server. The page shows an email address. (If you want a form later, use a service that offers a CAPTCHA-free option and test it for accessibility.)
* **Size limits.** GitHub's web upload accepts files up to 25 MB; the whole repository should stay under about 1 GB. For long videos, compress them first, or host them elsewhere (for example the Internet Archive) and link to them with `external_url`.

## Licence note

No licence has been chosen for the site code; choose one if you share it. EB Garamond is under the SIL Open Font License 1.1.
