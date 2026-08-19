import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const partialsDir = path.join(root, 'src/partials');

/*  Where the site will be served from.
 *
 *  A GitHub Pages project site lives under /<repo>/, a custom domain or a
 *  user site lives at /. Set BASE_PATH at build time and every path in the
 *  output follows; the default is a domain root.
 */
const base = process.env.BASE_PATH || '/';

/*  A 40-line include step instead of a template dependency.
 *
 *      <!--@ header nav="vision" -->
 *
 *  pulls src/partials/header.html and substitutes {{nav}}. Partials hold
 *  markup only — every asset reference lives in the page or in /public —
 *  so this can run ahead of Vite's own HTML pass without fighting it.
 */
function partials() {
  const read = (name) => fs.readFileSync(path.join(partialsDir, `${name}.html`), 'utf8');

  const render = (html, depth = 0) => {
    if (depth > 4) throw new Error('partial recursion too deep');
    return html.replace(/<!--@\s*([\w-]+)([\s\S]*?)-->/g, (_, name, rawArgs) => {
      const args = {};
      for (const m of rawArgs.matchAll(/([\w-]+)="([^"]*)"/g)) args[m[1]] = m[2];
      const body = read(name).replace(/\{\{\s*([\w-]+)(?:::(\w+))?\s*\}\}/g, (__, key, filter) => {
        const value = args[key] ?? '';
        /* `items="a|b|c"` with `{{items::li}}` becomes a real list. */
        if (filter === 'li') return value.split('|').map((item) => `<li>${item}</li>`).join('');
        if (filter === 'tag') return value.split('|').map((item) => `<span class="tag">${item}</span>`).join('');
        return value;
      });
      return render(body, depth + 1);
    });
  };

  return {
    name: 'budadiri-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => render(html),
    },
    configureServer(server) {
      server.watcher.add(partialsDir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(partialsDir)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

/*  Vite rebases the assets it processes, but not the two kinds of URL this
 *  site uses most: files served verbatim from public/, and links from one
 *  page to another. This runs after Vite's own pass and prefixes anything
 *  still rooted at / — including every candidate inside a srcset.
 */
function rebaseAbsoluteUrls() {
  const needsPrefix = (url) =>
    url.startsWith('/') && !url.startsWith('//') && !url.startsWith(base);
  const prefix = (url) => base + url.slice(1);

  const rewriteHtml = (html) =>
    html
      .replace(/\b(href|src|content)="([^"]+)"/g, (whole, attr, url) =>
        (needsPrefix(url) ? `${attr}="${prefix(url)}"` : whole))
      /* <meta http-equiv="refresh" content="0; url=/news.html"> */
      .replace(/\bcontent="(\d+;\s*url=)([^"]+)"/gi, (whole, lead, url) =>
        (needsPrefix(url) ? `content="${lead}${prefix(url)}"` : whole))
      .replace(/\bsrcset="([^"]+)"/g, (whole, set) => {
        const rebased = set
          .split(',')
          .map((candidate) => {
            const [url, ...rest] = candidate.trim().split(/\s+/);
            return [needsPrefix(url) ? prefix(url) : url, ...rest].join(' ');
          })
          .join(', ');
        return `srcset="${rebased}"`;
      });

  return {
    name: 'budadiri-rebase',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => (base === '/' ? html : rewriteHtml(html)),
    },
    generateBundle(_options, bundle) {
      if (base === '/') return;
      for (const file of Object.values(bundle)) {
        if (!file.fileName.endsWith('.css') || file.type !== 'asset') continue;
        file.source = String(file.source).replace(
          /url\((['"]?)(\/[^)'"]+)\1\)/g,
          (whole, quote, url) => (needsPrefix(url) ? `url(${quote}${prefix(url)}${quote})` : whole),
        );
      }
    },
  };
}

const pages = [
  'index', 'vision', 'development', 'progress', 'parliament',
  'community', 'news', 'about', 'resources', 'media', 'admin',
  '404', 'impact', 'updates',
];

export default defineConfig({
  base,
  plugins: [partials(), rebaseAbsoluteUrls()],
  appType: 'mpa',
  build: {
    target: 'es2020',
    cssTarget: 'chrome90',
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, path.resolve(root, `${p}.html`)])),
    },
  },
  server: { host: true, port: 5173 },
});
