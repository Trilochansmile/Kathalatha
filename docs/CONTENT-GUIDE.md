# Content guide — adding to KATHALATHHA without programming

You will do everything in your web browser on GitHub. You never need to install anything.

## The three ideas

1. **Files** (photographs, audio, video, documents) go in the `media` folder.
2. **Records** are short entries in the `data` folder: one file for each collection.
3. **Articles** have two parts: a line in `data/articles.json` and a text file in the `articles` folder.

After you save a change, wait one to two minutes and refresh the live site.

| You want to add… | Collection file |
|---|---|
| A word, phrase or language note | `data/language.json` |
| A poem, story, book | `data/literature.json` |
| A folk tale, saying, recorded narration | `data/folklore.json` |
| A song, instrument, performance | `data/music.json` |
| A photograph, document, place, practice | `data/history.json` |
| A person | `data/people.json` |
| An essay or article | `data/articles.json` + a file in `articles/` |

## Step 1. Upload your file (photo, audio, video, caption file, document)

1. In your repository click the `media` folder, then the right sub-folder (`images`, `audio`, `video`, `captions`, `documents`, `texts`).
2. Click **Add file → Upload files**, drag your file in, and click **Commit changes**.
3. Use a plain file name: lowercase letters, numbers and hyphens, no spaces. Example: `photograph-0001.jpg`, `song-0001.mp3`.
4. Remember the path. It is the folder plus the name: `media/images/photograph-0001.jpg`.

Sizes: the browser upload accepts up to 25 MB per file. Resize photographs to about 1600 pixels wide (a few hundred KB); use MP3 or M4A for audio and MP4 (H.264) for video.

## Step 2. Make the record text

**Easiest way.** Open `tools/entry-helper.html` on your live site (add `tools/entry-helper.html` to your site address). Fill in the boxes and press **Make the entry**. Copy the result.

**By hand.** Copy the example below and change the words between the quotation marks.

```json
{
  "id": "photograph-0001",
  "status": "awaiting-verification",
  "title": "Title in the original language",
  "title_english": "English title (a translation)",
  "format": "photograph",
  "lang": "or",
  "description": "Short description.",
  "image": "media/images/photograph-0001.jpg",
  "image_alt": "What the photograph shows, in one or two sentences.",
  "accessibility_description": "A fuller description for someone who cannot see it: people, place, clothing, activity, any writing.",
  "creator": "Photographer's name",
  "role": "photographer",
  "date": "about 1960",
  "source": "Who lent or gave it",
  "rights_status": "cleared-open",
  "rights": "Who holds the rights and under what licence"
}
```

### All the fields

Required: `id`, `title`, `format`, `status`.

| Field | What to write |
|---|---|
| `id` | A short unique name: lowercase letters, numbers, hyphens. Never change it later, or old links break. |
| `title` | In the original language first. |
| `title_english` | The English translation of the title (optional). |
| `format` | `photograph`, `audio`, `video`, `document`, `text`, `manuscript`, `publication` or `other`. |
| `status` | `verified`, `awaiting-verification`, `community-account`, `contested` or `sample`. Be honest: it is shown to readers. |
| `lang` | Language code of the title, description and text. `or` for text in Odia script, `en` for English, `hi` for Hindi. |
| `description` | A short description. `description_english` for the translation. |
| `text`, `text_english` | The full text, and its translation. For long texts use `text_file` / `text_english_file` instead (see Step 4). |
| `transcript`, `transcript_english` | The words of an audio or video recording. Or `transcript_file`. **Required for every recording.** |
| `image`, `image_alt`, `image_caption` | Photograph path, its alt text (**required**), and an optional caption. |
| `accessibility_description` | A full description of what is shown or seen. |
| `audio`, `video`, `video_poster` | Paths to the files. |
| `captions`, `captions_lang` | Path of a `.vtt` caption file for the video, and its language code (optional, defaults to `lang`). |
| `document` | Path of a PDF. `external_url` and `external_label` link to the item elsewhere. |
| `creator`, `role`, `date`, `locality` | Who made it, their role, when (any wording: "about 1960", "unknown"), and where (only if safe to share). |
| `subject` | A list of topics: `["wedding", "song"]`. |
| `source`, `provenance` | Where it came from and how it reached the archive. |
| `rights_status` | `cleared-open`, `cleared-restricted`, `pending` or `not-cleared`. Publish only when rights and consent are settled. |
| `rights` | Rights holder and licence. |
| `details` | Any extra labelled facts: `"details": { "Headword": "…", "Meaning in English": "…" }`. Use this for vocabulary and for the extra fields of each collection (performers, narrator, life dates…). Add only what you can source. |
| `keywords` | Extra search words: `["word one", "word two"]`. |
| `featured` | `true` to show the record on the Home page. |

**Marking a passage in another language** inside any text: `[[or: your Odia text]]`.

Fields you do not need can simply be left out.

## Step 3. Paste the record into the collection file

1. On GitHub open the collection file (for example `data/music.json`) and click the **pencil** (Edit).
2. You will see a list that looks like this:

```json
{
  "collection": "music",
  "items": [
    { …first record… },
    { …second record… }
  ]
}
```

3. To add a record at the **end**: put a **comma** after the last `}` of the last record, press Enter, and paste your new record after it. The very last record must have **no** comma after it.
4. Click **Commit changes…** and **Commit changes** again.
5. Check yourself: copy the whole file into the "Check a data file" box on the entry helper page. It points to the line where a comma is missing. After every save GitHub also runs a checker: a green tick next to your commit means fine, a red cross means click it and read the message.

The three usual mistakes: a missing comma between two records, a comma after the last record, a missing quotation mark. Straight quotation marks `"` only, never curly ones.

## Songs, stories and recordings

* **Song or recording:** upload the audio file, then make a record in `data/music.json` (or `folklore.json` for a story) with `"format": "audio"`, `"audio": "media/audio/….mp3"`, and the words in `transcript`. Put the original language first and the English in `transcript_english`.
* **Long transcript or story:** save it as a plain text file (`.txt`) in `media/texts/`, with an empty line between paragraphs, and use `"transcript_file": "media/texts/song-0001.txt"`. Words inside these files are also found by the search.
* **Video:** upload the video and a caption file, then `"format": "video"`, `"video": "media/video/….mp4"`, `"captions": "media/captions/….vtt"`, and a transcript.

### Making a caption (.vtt) file

Open Notepad (or any plain text editor) and type, saving the file as `story-0001.vtt` in UTF-8:

```
WEBVTT

00:00:01.000 --> 00:00:04.500
The first words that are spoken.

00:00:05.000 --> 00:00:09.000
The next words.
```

Each caption has a start and end time (minutes:seconds.thousandths) and the spoken words. A free tool such as Subtitle Edit can help with timing.

## Adding an article

1. Write your article in a text file. Save it as `articles/my-article.md` (use **Add file → Create new file** on GitHub and type the name with `articles/` in front, then paste the text).
2. Inside the article: `## Heading`, `### Smaller heading`, a blank line between paragraphs, `- ` for bullet points, `1. ` for numbered lists, `> ` for a quotation, `**bold**`, `*italics*`, `[link text](https://address)`, and pictures as `![description of the picture](media/images/picture.jpg)`. The article's title is shown automatically: do not repeat it. See the sample article for all of this in action.
3. Open `data/articles.json`, and add an entry inside the `"articles"` list (with a comma, as in Step 3):

```json
{
  "id": "my-article",
  "status": "awaiting-verification",
  "title": "Title of the article",
  "lang": "en",
  "author": "Author's name",
  "date": "2026-03-15",
  "category": "Essay",
  "summary": "One or two sentences that appear in the list.",
  "file": "articles/my-article.md"
}
```

Categories: Research article, Essay, Literary criticism, Commentary, Language writing, Documentation note. The date must be written year-month-day.

## Editing page text (About, Contact, section introductions)

Open the page (for example `about.html`), click the pencil, and change the words between tags such as `<p>` and `</p>`. Look for the lines that say `EDIT HERE`. Keep the tags themselves. Save with **Commit changes**.

* **Your email address:** in `contact.html` replace `your-email@example.org` in both places (once in `mailto:…`, once in the visible text).
* **Menu or footer:** these are the same in every page. To change them, change each page.

## Removing the sample content

1. Open each collection file and delete the whole sample record (from its opening `{` to its closing `}`, and one comma). If a collection becomes empty it should read `"items": []`.
2. In `data/articles.json` delete the sample article, and delete `articles/sample-article.md` (open the file, click the **…** menu → **Delete file**).
3. Delete the `media/images/sample-placeholder.svg` file.
4. In `index.html` and `digital-collections.html` delete the block that begins `<!-- SAMPLE NOTICE`. In `about.html` and `contact.html` delete the "Sample text" notices once you have written your own text.

## Good practice for every record

* Original language first; the English labelled as a translation.
* Never invent or "correct" Kosli words: write what your source gave you and name the source.
* Rights and consent settled before you publish. Keep consent records **outside** the site (the site is public).
* Every photograph has `image_alt` and `accessibility_description`; every recording has a transcript; every video has captions.
* To remove a record: delete its entry from the data file. Files in `media/` remain online until you delete them too.

## If something looks wrong

* **A list says "could not be loaded":** a data file has a comma or quotation-mark mistake. Use the checker on the entry helper page.
* **A picture or audio file does not appear:** the path in the record does not match the file name exactly (capital letters count). The automatic checker reports it.
* **A change does not show:** wait two minutes, then press Ctrl+F5 (Cmd+Shift+R on a Mac).
* **You made a mess:** on GitHub open the file → **History** → pick an earlier version. Nothing is ever lost.
