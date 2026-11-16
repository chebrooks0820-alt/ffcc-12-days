# FFCC 12 Days of Giving

Static site (no build step). Day 1 = Dec 13, Day 12 = Dec 24, 2026. Each gift unlocks at 12:00 AM Mountain Time.

## Publish on GitHub Pages
1. Create a repo and upload these files to the root (index.html, styles.css, app.js, config.js).
2. Settings > Pages > Deploy from a branch > `main` / `/ (root)` > Save.
3. Your site will be at `https://<account>.github.io/<repo>/`.

## Edit content
Everything is in `config.js`: titles, headlines, body paragraphs, link per day, donate link, raffle note.

Each day also has a `donateUrl` in config.js for its "Give to ..." button. Leave it empty and visitors see a "Donation link coming soon" placeholder.

## Add the Cognito form
In Cognito: Share > Embed > iFrame. Copy the URL inside `src="..."` into `cognito.embedUrl`.
Optional: set `prefillField` to a form field name (e.g. "Day") to auto-fill the day number.
Check the prefill and the iframe height on a phone.

## Test before launch
Add `?preview=2026-12-16` to the URL to see the site as if it were that date.
Set `allowPreview: false` in config.js before launch.

## Note
Unlocking uses the visitor's device clock, converted to Mountain Time. Page source is public, so don't put anything confidential in future days' content.
