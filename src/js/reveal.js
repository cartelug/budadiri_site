import { env } from './env.js';

/* Reveals run on IntersectionObserver, not on a scroll handler, and
 * each element is unobserved the moment it has played. Nothing here
 * needs GSAP. */
export function initReveals(root = document) {
  const targets = root.querySelectorAll('[data-reveal], [data-image-reveal], [data-lines]');
  if (!targets.length) return;

  if (env.reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => io.observe(el));
}

/* Split headings into masked lines. SplitType is imported only when a
 * page actually carries a [data-lines] heading. */
export async function initLines(root = document) {
  const heads = root.querySelectorAll('[data-lines]');
  if (!heads.length || env.reduced) return;

  const { default: SplitType } = await import('split-type');

  const split = () => {
    for (const head of heads) {
      if (head.dataset.split === 'done') continue;
      const result = new SplitType(head, { types: 'lines', lineClass: 'line-mask' });
      /* SplitType gives us the lines; the inner span is what actually
         travels, so the mask has something to clip. */
      for (const line of result.lines) {
        const inner = document.createElement('span');
        inner.append(...line.childNodes);
        line.append(inner);
      }
      head.dataset.split = 'done';
    }
  };

  /* Wait for the webfont before measuring, or the line boxes are wrong. */
  if (document.fonts?.ready) await document.fonts.ready;
  split();
}
