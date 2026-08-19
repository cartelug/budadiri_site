# Budadiri County East

The digital public face of Budadiri County East, Sironko District — the
constituency office of Hon. Julius Nakiyi, Member of Parliament.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the build
npm run media    # regenerate image derivatives + the archive index
python3 tools/build-fonts.py     # refetch and re-trim the three webfonts
node tools/build-graphics.mjs    # regenerate the drawn textures and the profile
```

## The direction

**The Slope.** The constituency is a place before it is an office, and the
place is a mountainside: Budadiri East runs from the valley road at about
1,150 metres to the Mount Elgon park boundary at about 2,400. Altitude is
the organising spine of the whole site — the palette is the flank read from
the top down, the homepage descends it band by band, and anything that sits
somewhere real carries `--alt` in metres and computes its own position on
the axis rather than being placed by eye.

Folded into it is **the register**: the dashboard is not a claim about being
transparent, it is the record itself, and every line carries a reference, a
date, a place on the slope, a status and a source.

Three faces, and the split is a rule rather than a preference:

| Face | Job |
| --- | --- |
| Vollkorn | speaks — statements, titles, the turned phrase |
| Chivo | explains — ledes, running text, labels, controls |
| IBM Plex Mono | reports — altitudes, references, dates, statuses |

Nothing checkable is set in the serif and nothing written in a human voice is
set in the mono, so on this site monospaced type means there is a source.

## What is here

| Page | Purpose |
| --- | --- |
| `index.html` | The slope: hero, the four-band transect, the register, today → 2036, the five pillars as an index, the record, closing |
| `vision.html` | The vision statement, read one clause at a time, with the constituency schematic |
| `development.html` | The five pillars in full, and how they map onto NDP IV |
| `progress.html` | People's Dashboard — the record, and the rules it is published under |
| `parliament.html` | Dated, sourced parliamentary archive |
| `community.html` | The digital constituency office: a four-step issue form, area index, opportunities |
| `news.html` | On the ground — one lead story, two secondary, then a dated index |
| `about.html` | The public record behind the Member of Parliament |
| `resources.html` | The framework chain and every source used on this site |
| `media.html` | 873 figures extracted from the three national documents |
| `admin.html` | Office prototype — reads submissions stored on this device only |

`impact.html` and `updates.html` are redirect stubs kept so links published
against the previous build do not break.

## Stack

Vite (multi-page), GSAP + ScrollTrigger, Lenis, SplitType. Sharp is a build
dependency for the image pipeline; fontTools trims the three webfonts. No CSS framework, no icon package, no
carousel library — the two horizontal cases are CSS scroll-snap and the
handful of icons are inline SVG.

GSAP and Lenis are loaded **only** when a scroll scene is present *and* the
viewport is a pointer desktop that has not asked for reduced motion. A phone
loading the news page never downloads them.

## Structure

```
src/
  partials/     HTML includes, expanded at build time by a plugin in vite.config.js
  styles/       tokens → base → type → layout → components → nav → motion → sections/*
  js/           nav, reveals, and one module per scene, all dynamically imported
  media/fonts/  the downloaded faces, before instancing and subsetting
  media/source/ the original supplied images; never referenced by the site directly
tools/
  build-fonts.py      fetch, instance and subset the three faces (53 KB total)
  build-media.mjs     crops, duotone, responsive derivatives, archive index
  build-graphics.mjs  grain tile, contour fields, terrace rule, elevation profile
public/         everything served as-is: fonts, derivatives, PDFs, PDF figures
```

Partial syntax, expanded by `vite.config.js`:

```html
<!--@ record subject="…" tags="Health|Bukiise" meter="20" … -->
```

`{{key}}` substitutes; `{{key::li}}`, `{{key::dd}}` and `{{key::tag}}` split a
`|`-separated value into list items, definitions or tags.

The two partials that carry the direction are `band` (one elevation band of
the transect, whose page height tracks its real vertical extent) and `record`
(one register row, shared by the homepage and the dashboard).

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`, and can also be run by hand from the Actions tab.

Pages must be building **from GitHub Actions**, not from a branch. A branch
source publishes the repository root — the unbuilt Vite source, whose
partials are still HTML comments — and it finishes after this workflow, so
it silently overwrites each deploy. The workflow asks the Pages API to
switch the source itself and warns if it cannot; the manual equivalent is
Settings → Pages → Source → GitHub Actions.

**The build does not need to know where it will live.** Every URL it emits is
relative, so the same `dist/` works at a domain root, under `/<repo>/` on
GitHub Pages, or in a subfolder on shared hosting. There is no base path to
configure and none to get wrong. A build step fails the workflow if any
root-absolute URL sneaks back into the HTML or CSS.

That holds because the site is flat: every page sits at the top level, with
`assets/`, `img/`, `fonts/` and `data/` beside them. If a page is ever moved
into a subdirectory, the relative links have to be revisited.

The published site is about 130 MB, and roughly 120 MB of that is the three
national PDFs and the 873 extracted figures. That is inside the 1 GB Pages
limit, and a full deploy takes about a minute. To publish without the
archive, drop `public/downloads` and `public/pdf-images` and host them
elsewhere.

## Editing content

Content lives in the page HTML, not in a data file, so it is indexable and
readable without JavaScript. To add a dashboard record, a parliamentary entry
or a news row, copy the matching `<!--@ … -->` line and change the values.

## Before public launch

1. Confirm the constituency office phone, email and WhatsApp, and publish them.
2. Verify every register status, date and classification with the office, and
   confirm or correct the indicative elevation band on each entry.
3. Replace the browser-local issue form with an authenticated backend, and add
   a consent notice, retention policy and role-based access control.
4. Confirm reuse permission for the supplied photographs.
5. Connect the domain, TLS, analytics and backups; serve `pdf-images/` and
   `downloads/` through a CDN — they are 120 MB of the 130 MB build.

## Photography

The site uses only material supplied by the constituency: two official
portraits and a two-part visual of Budadiri today and a 2036 projection. The
2036 frame is an illustrative projection and is labelled as one everywhere it
appears. Where a photograph of Budadiri East does not exist, the page uses
typography and drawn geography rather than stock imagery of somewhere else.
