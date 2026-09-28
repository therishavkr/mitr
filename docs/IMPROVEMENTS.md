# Improvements & Known Issues

Things worth doing next, found across a full repo audit. None of these block current functionality — they're flagged here rather than fixed silently, since several touch decisions (deletions, renames, content, priority) that are the project owner's call.

## Resolved since the last pass

Kept brief so nobody re-verifies these — confirmed gone/done during this audit:

- `dist/` no longer exists in the repo at all (previously flagged as a stale second copy of the site — it's been deleted, not just out of date).
- `nav.js`, `footer.js`, and `yearbook-responsive-patch.css` are gone (previously flagged as dead code superseded by `site-chrome.js`).
- The yearbook flipbook now loads in throttled batches of 6 pages instead of rendering all 50 synchronously before opening (previously flagged as a slow, blocking load).

## Bugs & broken UX

- **Four dead contact buttons on `Faculty co  ord/directory.html`.** The two hand-coded "Advisor" cards at the top of the page (Prof. Gummadi, Prof. Sathian) have Email/Call icon buttons that are literally `href="#"` — they do nothing. Unlike the rest of the faculty grid below them (which is data-driven from `faculty.json` and has working `mailto:`/`tel:` links), these two are static HTML with no real contact info behind them, and neither advisor appears in `faculty.json` to source it from. This is the page whose entire purpose is providing contact info, so four dead buttons here stand out more than elsewhere.
- **Two "Achievements & Media" links in `yearbook.html` are still `href="#"`** (Press Information Bureau and Times of India articles), each with a `<!-- TODO -->` comment above it waiting on the real URL. (A third one that used to be tracked here, a "MITR Impact Report" card, has since been removed from the page.)
- **`index.html` has two `<h1>` elements** — the hero heading ("Your Wellbeing is Our Priority") and a second one further down in the "Empowering Wellness" section. Not invalid HTML, but most SEO tools and some screen readers treat `<h1>` as the one main page title; the second should probably be an `<h2>`.

## Accessibility

- **No modal on the site manages focus.** `sos-modal`, `coffee-modal`, `booking-modal`, `feedback-modal`, `schedule-modal` (directory.html), and `alumni-modal` (yearbook.html) all open without moving focus into the dialog, don't trap Tab/Shift+Tab inside it while open, and don't return focus to the button that opened it when it closes (the one exception is the mobile hamburger menu, which does return focus on Escape). For a keyboard or screen-reader user, opening "Book a Coffee" or the SOS modal doesn't actually move them there — they can keep tabbing through whatever's behind it. Since these modals are most of the site's actual interactive functionality (every booking/contact flow goes through one), this is worth fixing once, in one shared place, rather than per-modal.
- **The search box and three filter dropdowns on `directory.html` have no `<label>`, `aria-label`, or `aria-labelledby`.** A screen reader announces them as an unlabeled textbox/comboboxes — the placeholder text on the search input isn't a substitute (it disappears on input and isn't reliably announced as a label). Cheap fix: visually-hidden `<label>` elements or `aria-label` on each.
- **No custom `focus-visible` styling anywhere on the site** (checked all 5 pages and `site-chrome.js`) — buttons and links rely entirely on the browser's default focus outline, which still shows (nothing suppresses it), so this isn't a "keyboard users get nothing" bug, just an unstyled one that doesn't match the site's visual language the way the hover states do.
- **A real accessibility pass hasn't been done** (axe-core or similar automated scan, plus manual screen-reader + keyboard-only testing) — color contrast on the glassmorphism panels against varying background photos in particular hasn't been checked.

## Performance

- **`dostiitmlogo.svg` is 500KB and isn't actually vector.** Inspecting it shows a base64-embedded raster image wrapped in an SVG filter, not real paths — so every page pays a 500KB download for a logo rendered at roughly 48px tall in the header and footer. Re-exporting it as a true small vector, or just a properly-sized PNG/WebP, would be one of the highest-value/lowest-effort fixes on this list.
- **42 of the 49 images across `Achievements/`, `Alumni/`, `Faculty co  ord/`, `Events-Flagship/`, and `Event Carosel/` are still full-size `.jpg`/`.png`** (only `core/` has been converted to `.webp`), totaling roughly 9MB. A few standouts: `Events-Flagship/Copy of Orientation 2026-27.png` is 2MB alone and is only ever shown as a ~256px-tall card background on `yearbook.html`; several faculty headshots (`George.jpg`, `Arockiarajan.jpg`) are 650–790KB each for what renders as a small grid thumbnail. A resize + `webp` conversion pass on these specific folders would cut yearbook.html's weight the most, since it's the most image-heavy page.
- **The git history itself has bloated from repeatedly committing large binaries.** `yearbook.pdf` (49MB) and `CORE_PHOTOS_2026.pdf` (4MB) have each been committed twice in history, and `.git` is now ~69MB on disk even though the current working tree's largest file is 49MB — meaning an old revision of at least one of these is still sitting in the pack. Every fresh clone pays for this. Git LFS (ideally set up *before* the next large-binary change) or migrating history with `git filter-repo` would fix this, but the latter rewrites history and needs a force-push everyone would need to know about — worth planning deliberately, not doing casually.
- **The yearbook flipbook's `RENDER_SCALE` (1.5) is fixed for every device**, and pdf.js re-renders every page from scratch, client-side, on every single visit. See [Future Improvements](#future-improvements--upgradations) for pre-rendering this once instead.

## SEO / link sharing

- **Only `directory.html` has a `<meta name="description">`.** `index.html` — the homepage — has none.
- **No Open Graph tags (`og:title`, `og:description`, `og:image`) on any page.** Sharing a link to this site in WhatsApp, Slack, or social media currently shows a bare link with no preview card.
- **No `robots.txt` or `sitemap.xml`.** Minor for a small site like this, but both are a five-minute add if the team ever cares about search indexing.

## Deployment / build

- **`vite.config.js`'s build input list is still missing the faculty page.** `rollupOptions.input` lists `main`, `emergency`, `directory`, `yearbook` — but not `Faculty co  ord/directory.html`. Moot while `npm run build` isn't part of the actual deploy (see below), but would silently drop that page if it ever is.
- **Deployment still bypasses the build entirely.** `vercel.json` sets `buildCommand: ""` and `outputDirectory: "."`, so Vercel serves the repo root as static files — `npm run build` produces a local `dist/` that nothing downstream consumes. Worth either wiring it in for real (minification, cache-busted asset hashes) or just being explicit that this project is intentionally build-free.
- **`Mitr Website Suggestions.docx` (~1.7MB) still sits at the repo root.** Doesn't look like a deployed asset — worth confirming it belongs in version control at all versus a shared drive.

## Architecture

- **Tailwind config is duplicated per page, with inconsistent token names.** Each of the five pages declares its own inline `tailwind.config` with the same color palette, but the custom spacing/font token *names* differ (e.g. `margin-page` vs. `page` vs. `margin-mobile`). `site-chrome.js` works around this by only using stock utilities plus the identically-defined color tokens, but it's a landmine for anyone adding new shared markup without knowing that constraint.
- **No automated test suite is checked into the repo.** All verification during recent work (mobile responsiveness, the shared-chrome refactor, every modal built this session) was done with one-off Playwright scripts outside the repo, so none of those checks run again automatically. A small `tests/` folder with a handful of committed Playwright checks (header/footer injection, no horizontal overflow at a few widths, the modals opening) would let future work build on prior verification instead of re-deriving it every time.
- **The `Faculty co  ord` folder name has a literal double space.** Works today (the code handles it via careful quoting/`encodeURIComponent`), but it's a recurring footgun for anyone editing by hand or adding new tooling. Renaming it is a breaking change to every relative path that references it, so it needs a deliberate pass, not a quick fix.

## Future Improvements & Upgradations

Forward-looking ideas, as opposed to the fixes above — none of this is broken today, it's about what the site could become.

### Yearbook / PDF viewer

- **Server-side (or build-time) PDF-to-image pre-rendering.** Every visitor's browser currently re-renders all 50 pages of the 49MB PDF from scratch. Pre-rendering each page to a static WebP/AVIF once (at build or upload time) and serving those instead would cut load time dramatically and remove the client-side rendering cost entirely — pdf.js would no longer be needed at all.
- **Swipe gestures for mobile.** `page-flip` supports touch, but a dedicated left/right swipe affordance (with a small hint animation on first load) would make the flipbook feel native on phones rather than desktop-first.
- **Deep-linking to a page.** `yearbook.html?page=12` (or a `#page=12` hash) so a specific page can be shared/bookmarked directly, instead of every link landing on page 1.

### Content & data

- **A lightweight admin flow for the JSON data files.** `events.json`, `team.json`, `quotes.json`, and `Faculty co  ord/faculty.json` all now drive their pages — a real improvement over hardcoded HTML — but they're still hand-edited JSON in a code editor. A small static form (even client-side only, generating the JSON to copy-paste, or backed by a free headless CMS like Decap/Netlify CMS) would let a non-technical team member update the roster or events without touching code.
- **A real events calendar**, not just a static grid — filterable by upcoming/past, with dates, so "Workshops & Events" can show what's actually happening this month rather than a fixed list.
- **Multi-language content.** The team directory already tracks each coordinator's spoken languages; the site itself is English-only. Even a partial Tamil/Hindi translation of the emergency contacts page (the highest-stakes page on the site) would meaningfully widen who can use it in a crisis.

### UX

- **Dark mode.** `darkMode: "class"` is already configured in every page's Tailwind config but nothing ever toggles the class — the config exists but the feature doesn't.
- **Replace the mailto-compose flow with a real form submission** for booking/coffee/feedback, for visitors without a configured Gmail account (or on desktop without a mail client). A free form backend (Formspree, a Vercel serverless function, Google Forms behind the same UI) would remove the "hope they have Gmail open" dependency while keeping the "no backend to maintain" spirit.

### Infrastructure

- **CI checks on every PR**: even just "does the build not crash" plus a couple of the Playwright checks already written ad hoc during this project's recent work (see "No automated test suite" above) would catch regressions before they reach production instead of after.
- **Basic analytics**, if the team ever wants to know which pages/features get used — privacy-respecting only (e.g. Plausible or Vercel Analytics, no cookies), and the footer's "this site doesn't collect any of your data" line would need to be updated to stay accurate if this is ever added.
