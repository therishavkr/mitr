# Team MITR — Wellness Portal

A static, multi-page website for **Team MITR**, IIT Madras's student-and-faculty peer wellness body ("In need and indeed for you"). The site gives students a way to reach emergency/counselling support, find peer and faculty coordinators, book sessions, and browse event photos — all without a backend.

## Pages

| Page | Purpose |
|---|---|
| [`index.html`](index.html) | Home — hero, quick-access tiles, Director's message, positive-quote generator, stats |
| [`emergency.html`](emergency.html) | Support Desk — campus and national emergency contacts |
| [`directory.html`](directory.html) | Contact Us — searchable/filterable peer coordinator and faculty advisor directory |
| [`yearbook.html`](yearbook.html) | Gallery — photo carousel, flagship/upcoming events, PDF yearbook flipbook |
| [`pages/faculty-directory.html`](pages/faculty-directory.html) | Faculty advisor sub-directory |

## Tech stack

- **Plain HTML + vanilla JS** — no framework, no build-time templating.
- **Compiled Tailwind CSS v4.3.3** (`src/css/tailwind.min.css`) — latest stable release. Theme tokens live in `src/css/tailwind-src.css`. Rebuild with `npm run build:css` after changing utility classes. Do **not** use the Tailwind Play CDN (`cdn.tailwindcss.com`) in production.
- **[Vite](https://vitejs.dev/)** — used only as a local dev server (`npm run dev`) for live reload. It is *not* part of the deployed site (see [Deployment](#deployment) below).
- **[pdf.js 4.10.38](https://mozilla.github.io/pdf.js/)** + **[page-flip](https://github.com/Nodlik/StPageFlip)** — render `assets/docs/yearbook.pdf` into a page-turning flipbook on `yearbook.html`.

## Folder layout

| Folder | Contents |
|---|---|
| root | Deployed HTML pages (`index`, `emergency`, `directory`, `yearbook`), `submit.php`, `api/`, config |
| `pages/` | Nested HTML pages (faculty sub-directory) |
| `src/css`, `src/js` | Stylesheets and scripts (page scripts + shared `site-chrome`, `booking`, `coffee`, `feedback`, `departments`) |
| `src/data` | JSON content (`team`, `faculty`, `events`, `quotes`) and `source/` spreadsheets |
| `assets/images` | `faculty`, `core`, `alumni`, `achievements`, `carousel`, `events` photos |
| `assets/brand` | Logos and favicons |
| `assets/docs` | PDFs (yearbook, counsellor schedule, alumni rosters) |
| `docs/` | Internal notes (`IMPROVEMENTS.md`, website suggestions) |

## Shared "site chrome"

Header, footer, the SOS "Call for help" modal, and the mobile menu are **not** copy-pasted per page. Every page drops in two empty placeholders:

```html
<div data-site-header></div>
...
<div data-site-footer></div>
```

[`site-chrome.js`](src/js/site-chrome.js) finds them at load time and replaces them with the real markup, so header/footer changes land on all five pages from one file. It resolves its own path via `document.currentScript`, so the same script works from both the site root and the nested `pages/` page.

Other shared, self-injecting behavior scripts (each looks for a `data-open-*` trigger attribute and does nothing if that page doesn't have one):

| Script | Trigger | Does |
|---|---|---|
| [`booking.js`](src/js/booking.js) | `[data-open-booking]` | "Book a Session" modal → opens a pre-filled Gmail compose window to the chosen venue |
| [`coffee.js`](src/js/coffee.js) | `[data-open-coffee]` | "Book a Coffee with MITR" modal → mails the team inbox, never an individual coordinator |
| [`feedback.js`](src/js/feedback.js) | `[data-open-feedback]` (footer "Feedback" link) | Feedback modal → mails the team inbox + maintainers |
| [`departments.js`](src/js/departments.js) | — | Exposes `window.departmentName()` to normalize inconsistent department names across data sources |

**There is no backend.** Every "submit" action builds a `https://mail.google.com/mail/?view=cm&fs=1&...` URL from the form fields and opens it with `window.open()`, synchronously inside the click handler (so it isn't blocked as a popup). The visitor reviews and sends the email themselves, from their own Google account.

## Data files

Content that used to be hardcoded inline in the HTML now lives in JSON, fetched at runtime:

- [`src/data/events.json`](src/data/events.json) — Workshops & Events grid on `yearbook.html`
- [`src/data/team.json`](src/data/team.json) — peer coordinators on `directory.html`
- [`src/data/quotes.json`](src/data/quotes.json) — index.html's "Random Positive Message Generator"
- [`src/data/faculty.json`](src/data/faculty.json) — faculty advisors, used by both `directory.html` and the faculty sub-page

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (e.g. `http://localhost:5173`). All pages are static — you can also just open `index.html` directly in a browser, except that `fetch()` calls (JSON data, the yearbook PDF) are blocked on `file://` pages, so use `npm run dev` for real testing.

## Deployment

[`vercel.json`](vercel.json) sets `buildCommand: ""` and `outputDirectory: "."` — **Vercel serves the repository root directly, with no build step.** `npm run build` (→ `vite build`, output to a local `dist/`) is *not* part of the deploy path today, and `dist/` is not checked into the repo — running the build script just produces a local build artifact that nothing consumes.

## Known quirks worth knowing before you touch things

- **Shared Tailwind theme lives in `src/css/tailwind-src.css` (Tailwind v4 `@theme`).** After changing utility classes, rebuild with `npm run build:css` so `src/css/tailwind.min.css` stays in sync. `site-chrome.js` only uses complete class-name string literals so the scanner can pick them up.
- **`yearbook.pdf` is ~49MB** and is fetched + rendered client-side page by page (via `pdf.js`), in batches of 6, so the flipbook opens as soon as the first batch renders instead of waiting on the whole file.
