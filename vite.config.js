import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const partialsDir = path.join(root, 'src/partials');

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

const pages = [
  'index', 'vision', 'development', 'progress', 'parliament',
  'community', 'news', 'about', 'resources', 'media', 'admin',
  '404', 'impact', 'updates',
];

export default defineConfig({
  plugins: [partials()],
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
