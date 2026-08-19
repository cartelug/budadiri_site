import { env } from './env.js';

let gsapRef = null;
let stRef = null;
let lenisRef = null;

/* GSAP and Lenis are only fetched when a scene actually needs them, so
 * a phone that gets none of the scroll scenes never downloads them. */
export async function scroller() {
  if (gsapRef) return { gsap: gsapRef, ScrollTrigger: stRef, lenis: lenisRef };

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  gsapRef = gsap;
  stRef = ScrollTrigger;

  if (!env.reduced) {
    const { default: Lenis } = await import('lenis');
    /* Wheel smoothing only. Touch keeps the platform's own scrolling,
     * so momentum, overscroll and the address-bar behaviour stay native. */
    lenisRef = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
    });
    lenisRef.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenisRef.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  return { gsap: gsapRef, ScrollTrigger: stRef, lenis: lenisRef };
}

export function stopScroll(locked) {
  if (!lenisRef) return;
  locked ? lenisRef.stop() : lenisRef.start();
}

export function scrollTo(target, offset = 0) {
  if (lenisRef) { lenisRef.scrollTo(target, { offset, duration: 1 }); return; }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: env.reduced ? 'auto' : 'smooth' });
  }
}
