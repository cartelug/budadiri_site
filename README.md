# Budadiri County East

The digital public face of Budadiri County East, Sironko District — the
constituency office of Hon. Julius Nakiyi, Member of Parliament.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the build
npm run media    # regenerate image derivatives + the archive index
```

## What is here

| Page | Purpose |
| --- | --- |
| `index.html` | The long-form constituency story: hero, principles, today → 2036, the five pillars, dashboard, framework, Parliament, news |
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
dependency for the image pipeline. No CSS framework, no icon package, no
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
  media/source/ the original supplied images; never referenced by the site directly
tools/
  build-media.mjs     crops, duotone, responsive derivatives, archive index
  build-graphics.mjs  grain tile, contour fields, terrace rule
public/         everything served as-is: fonts, derivatives, PDFs, PDF figures
```

Partial syntax, expanded by `vite.config.js`:

```html
<!--@ record subject="…" tags="Health|Bukiise" meter="20" … -->
```

`{{key}}` substitutes; `{{key::li}}` and `{{key::tag}}` split a `|`-separated
value into list items or tags.

## Editing content

Content lives in the page HTML, not in a data file, so it is indexable and
readable without JavaScript. To add a dashboard record, a parliamentary entry
or a news row, copy the matching `<!--@ … -->` line and change the values.

## Before public launch

1. Confirm the constituency office phone, email and WhatsApp, and publish them.
2. Verify every dashboard status, date and classification with the office.
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
