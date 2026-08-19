import { env } from '../env.js';

/* Five chapters held on one screen.
 *
 * Desktop only. On anything narrower the markup is already five
 * stacked blocks and this module returns without loading GSAP, so a
 * phone pays nothing for a behaviour it never sees.
 */
export async function initPillars(section) {
  const stage = section.querySelector('[data-pillars-stage]');
  const chapters = [...section.querySelectorAll('[data-chapter]')];
  const tones = [...section.querySelectorAll('[data-tone]')];
  const rail = [...section.querySelectorAll('[data-rail]')];
  if (!stage || chapters.length < 2) return;

  const setActive = (index) => {
    chapters.forEach((ch, i) => ch.classList.toggle('is-active', i === index));
    tones.forEach((tone, i) => tone.classList.toggle('is-on', i === index));
    rail.forEach((btn, i) => btn.setAttribute('aria-current', String(i === index)));
  };

  if (!env.scenes) { chapters.forEach((c) => c.classList.remove('is-active')); return; }

  setActive(0);

  const { ScrollTrigger } = await import('../motion.js').then((m) => m.scroller());
  const trigger = ScrollTrigger.create({
    /* The stage is both the trigger and the pinned element: the section
       also contains its heading, and pinning against that would park the
       stage half a screen down. */
    trigger: stage,
    start: 'top top',
    end: () => `+=${chapters.length * 90}%`,
    pin: stage,
    pinSpacing: true,
    onUpdate: (self) => {
      const index = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
      setActive(index);
    },
  });

  rail.forEach((btn, i) => {
    btn.addEventListener('click', async () => {
      const span = trigger.end - trigger.start;
      const target = trigger.start + (span * (i + 0.4)) / chapters.length;
      const { scrollTo } = await import('../motion.js');
      scrollTo(target);
    });
  });
}
