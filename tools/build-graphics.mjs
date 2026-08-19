/*  The constituency's visual language, drawn rather than downloaded.
 *
 *  Budadiri East sits on the western shoulder of Mount Elgon: a caldera,
 *  terraced coffee slopes, and a river that happens to be the boundary
 *  with Budadiri West. Those three facts generate every texture on the
 *  site — contour rings, terrace rules, and a single meandering line.
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';

await fs.mkdir('public/img', { recursive: true });
await fs.mkdir('src/partials', { recursive: true });

/* ── deterministic noise ─────────────────────────────────────────── */
let seed = 20260818;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/* ── grain: a 140px tile beats an SVG filter on a cheap Android ──── */
const G = 140;
const grain = Buffer.alloc(G * G * 4);
for (let i = 0; i < G * G; i++) {
  const v = rnd();
  const lum = v < 0.5 ? 0 : 255;
  grain[i * 4] = grain[i * 4 + 1] = grain[i * 4 + 2] = lum;
  grain[i * 4 + 3] = Math.round(Math.abs(v - 0.5) * 2 * 46);
}
await sharp(grain, { raw: { width: G, height: G, channels: 4 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/img/grain.png');

/* ── contours: nested closed curves around the Elgon caldera ─────── */
function ring(cx, cy, rx, ry, phase, wobble) {
  const pts = [];
  const STEPS = 40;
  for (let i = 0; i < STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const k = 1 + wobble * (Math.sin(3 * t + phase) * 0.62 + Math.sin(5 * t + phase * 1.7) * 0.3
      + Math.sin(7 * t - phase * 0.4) * 0.14);
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  /* Catmull-Rom → cubic bézier, closed. */
  let d = `M${pts[0][0].toFixed(0)} ${pts[0][1].toFixed(0)}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${p2[0].toFixed(0)} ${p2[1].toFixed(0)}`;
  }
  return d + 'Z';
}

function contourPaths({ cx = 640, cy = 360, count = 12, step = 46 } = {}) {
  const out = [];
  for (let i = count; i >= 1; i--) {
    const t = i / count;
    out.push({
      d: ring(cx, cy, step * i * 1.28, step * i, i * 0.42, 0.045 + t * 0.075),
      t,
    });
  }
  return out;
}

const contourSvg = (stroke, opacityScale) => {
  const body = contourPaths()
    .map(({ d, t }) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${(1.35 - t * 0.7).toFixed(2)}" stroke-opacity="${(opacityScale * (0.34 + (1 - t) * 0.66)).toFixed(3)}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">${body}</svg>`;
};

await fs.writeFile('public/img/contour-dark.svg', contourSvg('#0d2a1f', 0.5));
await fs.writeFile('public/img/contour-light.svg', contourSvg('#f2eee4', 0.42));

/* ── terraces: the hairline rule used as a section divider ───────── */
const rows = Array.from({ length: 8 }, (_, i) => {
  const y = 6 + i * 11;
  const inset = Math.round(Math.sin(i * 0.95) * 44 + 52);
  return `<line x1="${inset}" y1="${y}" x2="${400 - inset * 0.55}" y2="${y}" stroke="currentColor" stroke-width="1.6" stroke-opacity="${(0.62 - i * 0.055).toFixed(2)}"/>`;
}).join('');
await fs.writeFile('src/partials/terrace.html',
  `<svg class="terrace" viewBox="0 0 400 88" aria-hidden="true" focusable="false">${rows}</svg>\n`);

/* ── the profile: a cross-section of the flank this county farms ──
 *
 *  This is the mark the whole site is built on. Mount Elgon is a shield
 *  volcano, so its flank is concave: gentle where the road runs, steep
 *  by the time you reach the park boundary. The curve below is that
 *  form — elevation rising from the valley floor at 1,150 m to the
 *  boundary at 2,400 m across roughly eighteen kilometres — cut by the
 *  radial stream valleys that give the slope its spurs.
 *
 *  It is schematic. It is drawn to the real range and the real shape of
 *  the flank, and it is captioned as schematic everywhere it appears,
 *  because nothing on this site claims to be a survey it is not.
 */
const FLOOR = 1150;
const RIDGE = 2400;

/* Elevation in metres at distance t (0 = valley road, 1 = boundary). */
const elevation = (t) => {
  const shield = Math.pow(t, 1.42);              /* the concave flank   */
  const spurs = Math.sin(t * 13.5) * 0.021       /* stream valleys      */
    + Math.sin(t * 27 + 1.2) * 0.009
    + Math.sin(t * 41 + 0.4) * 0.004;
  return FLOOR + (RIDGE - FLOOR) * Math.max(0, Math.min(1, shield + spurs * (0.35 + t)));
};

const W = 1200;
const H = 320;
const PAD_B = 26;
const x = (t) => t * W;
const y = (m) => H - PAD_B - ((m - FLOOR) / (RIDGE - FLOOR)) * (H - PAD_B - 14);

const ridgeLine = () => {
  const steps = 96;
  let d = `M0 ${y(elevation(0)).toFixed(0)}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    d += `L${x(t).toFixed(0)} ${y(elevation(t)).toFixed(0)}`;
  }
  return d;
};

/* Strata: the same curve repeated below itself, the way a slope is
   shaded on a contour map. They fade as they go down into the valley. */
const strata = () => {
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const drop = i * 17;
    const steps = 48;
    let d = `M0 ${(y(elevation(0)) + drop).toFixed(0)}`;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      d += `L${x(t).toFixed(0)} ${(y(elevation(t)) + drop).toFixed(0)}`;
    }
    out.push({ d, o: (0.3 - i * 0.038).toFixed(2) });
  }
  return out;
};

/* The four bands this constituency is read in. */
const BANDS = [1400, 1700, 2000];
const bandTicks = () => BANDS.map((m) => {
  /* Invert the elevation curve to find where that metre mark falls. */
  let lo = 0; let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (elevation(mid) < m) lo = mid; else hi = mid;
  }
  const t = (lo + hi) / 2;
  return { m, x: x(t).toFixed(0), y: y(m).toFixed(0) };
});

const profile = [
  `<svg class="profile" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">`,
  '  <g class="profile__strata">',
  ...strata().map(({ d, o }, i) => `    <path d="${d}" pathLength="1" style="--i:${i};--o:${o}"/>`),
  '  </g>',
  ...bandTicks().map(({ x: tx, y: ty }, i) =>
    `  <line class="profile__tick" x1="${tx}" y1="${ty}" x2="${tx}" y2="${H}" style="--i:${i}"/>`),
  `  <path class="profile__ridge" d="${ridgeLine()}" pathLength="1"/>`,
  '</svg>',
].join('\n');

await fs.writeFile('src/partials/profile.html', profile + '\n');

console.log('graphics: grain tile, 2 contour fields, terrace rule, elevation profile');
