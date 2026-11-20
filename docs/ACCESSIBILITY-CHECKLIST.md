# Accessibility testing checklist — KATHALATHHA

**Target:** WCAG 2.2 Level AA. This is a design target. **Do not claim conformance until these tests are done on the live site.** Automated tools find only part of the problems, so every automated pass needs the manual checks as well. For each test record: date, tester, browser and assistive technology, result, and what you fixed.

## A. Preparation

* Screen readers: NVDA with Firefox and Chrome (Windows, free); VoiceOver with Safari (Mac and iPhone); TalkBack (Android).
* Also: keyboard only (put the mouse aside), browser zoom, one automated checker (WAVE, axe DevTools or Lighthouse), a colour-contrast checker.
* If you can, invite blind and low-vision users, and pay them for their time.
* Test the live GitHub Pages address, not a local copy.

## B. Pages to test

Home · a section page (for example Literature) · Digital Collections with a search · a photograph record · an audio record · a video record · a text record · Articles list · an article · About · Contact · 404 page (type a wrong address) · the Entry helper tool (curator's page).

## C. Checks

| # | Area | What to check | Pass? |
|---|---|---|---|
| 1 | Page titles | Each page has a different, descriptive title (look at the browser tab) | |
| 2 | Language | `lang` is set; Odia-script passages carry a `lang` code (`or`) | |
| 3 | Skip link | First Tab press shows "Skip to main content"; Enter jumps to the main content | |
| 4 | Landmarks | Screen reader lists banner, navigation (Main, Footer), main, search, contentinfo | |
| 5 | Headings | One `h1` per page; no skipped levels; headings describe sections | |
| 6 | Menu | All items reachable by Tab; current page announced ("current page"); on a phone-width window the Menu button announces expanded/collapsed; Esc closes it | |
| 7 | Focus visible | A clear plum outline on every link, button, field; never hidden behind other content (2.4.11) | |
| 8 | Keyboard | Everything works without a mouse; no keyboard traps; logical order | |
| 9 | Search | Field has a label and hint; Enter or the button searches; the result count or "No records match" is announced; filters are labelled and announce results | |
| 10 | Show more | The "Show more records" button works by keyboard and focus moves to the first new record | |
| 11 | Record page | Original language first; translations labelled; details read in order as term and value | |
| 12 | Images | Specific alt text; thumbnails in lists are decorative; long description is present | |
| 13 | Audio | Player controls named and keyboard-operable; transcript directly on the page | |
| 14 | Video | Controls keyboard-operable; captions can be switched on and are correct; transcript and description present | |
| 15 | Documents | PDFs are tagged or have a text version | |
| 16 | Forms | Every field has a visible label; hints are read; no CAPTCHA; no time limits | |
| 17 | Contrast | Text 4.5:1 or more; focus rings, borders and buttons 3:1 or more. Plum on ivory 12.3:1 and on lilac 10.3:1 were calculated; Muted Lavender is used only for decoration. Check hover states too | |
| 18 | Colour alone | Links are underlined; statuses are written words, not only colour | |
| 19 | Zoom and reflow | At 200% and 400% zoom (320 px wide) no horizontal scrolling and nothing lost | |
| 20 | Text spacing | With a text-spacing bookmarklet or extension (line height 1.5, letter 0.12em, word 0.16em) nothing overlaps or is cut off | |
| 21 | Text size | Raising the browser's default font size makes the text larger | |
| 22 | Target size | Buttons and links are at least 24 × 24 px (2.5.8) | |
| 23 | Motion | Nothing flashes; with "reduce motion" switched on nothing animates | |
| 24 | Responsive | Phone, tablet, desktop, portrait and landscape | |
| 25 | Consistent help | Contact is in the same place (menu and footer) on every page (3.2.6) | |
| 26 | No barriers | No CAPTCHA, pop-ups, cookie banners, overlays or compulsory sign-up | |
| 27 | Odia rendering | Odia letters and conjuncts (including the name କଥାଲଥା) display correctly in Chrome, Firefox, Safari and Edge on Windows, macOS, Android and iOS | |
| 28 | Screen-reader Odia | Each screen reader reads Odia text without garbling; note which voices are installed | |
| 29 | High contrast | Windows High Contrast / forced-colours mode: everything still visible | |
| 30 | Print | Print preview is readable | |
| 31 | No JavaScript | With scripts off, the menu is visible and the "JavaScript is needed" message appears on list pages | |

## D. Notes

1. **Language codes.** Voices follow the language code. The site uses `or` (Odia) by default. Confirm the right code for Kosli with Kosli speakers and the registries, then update `"lang"` in the records.
2. **Run the automatic checker** (the green tick on GitHub) after every change: it catches broken links, missing alt text and missing files.
3. **Retest** after changing the design or adding a new kind of content.
4. **Publish an accessibility statement.** A first one is on the About page (`#accessibility`). Update it with what you tested and what still fails.
5. **Keep a fix list** with dates and what you did.
