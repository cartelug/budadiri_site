/* Entry point.
 *
 * Everything below the navigation is loaded on demand: a page only
 * downloads the module for a section it actually contains, and the
 * scroll libraries only arrive if a scene asks for them. A phone
 * loading the news page never fetches GSAP.
 */
import { initHeader, initMenu, initAnchors, markCurrent } from './nav.js';
import { initReveals, initLines } from './reveal.js';

markCurrent();
initHeader();
initMenu();
initAnchors();
initReveals();
initLines();

/* Draw the hero contours once the first paint is out of the way. */
const hero = document.querySelector('[data-hero]');
if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-drawn')));

const load = async (selector, loader) => {
  const node = document.querySelector(selector);
  if (!node) return;
  const init = await loader();
  init(node);
};

/* Fired, not awaited: each section boots as soon as its own module
   lands, and none of them blocks another. */
load('[data-principles]', async () => (await import('./scenes/principles.js')).initPrinciples);
load('[data-transform]', async () => (await import('./scenes/transformation.js')).initTransformation);
load('[data-pillars]', async () => (await import('./scenes/pillars.js')).initPillars);
load('[data-framework]', async () => (await import('./scenes/framework.js')).initFramework);
load('[data-office-form]', async () => (await import('./office.js')).initOffice);
load('[data-archive]', async () => (await import('./media.js')).initArchive);
load('[data-console]', async () => (await import('./console.js')).initConsole);
