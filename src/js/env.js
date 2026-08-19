/* One place that decides how much motion this device should be asked
 * to do. Everything else asks here rather than sniffing on its own. */

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const mqDesktop = window.matchMedia('(min-width: 1100px)');

/* A cheap Android gets the content and the layout, not the pinning.
 * deviceMemory is Chromium-only, which is exactly the fleet we are
 * protecting; anything that does not report is assumed capable. */
const lowPower =
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

export const env = {
  get reduced() { return mqReduce.matches; },
  get hover() { return mqHover.matches; },
  get desktop() { return mqDesktop.matches; },
  lowPower,
  /* Scroll-driven scenes are for pointer desktops that are not
   * explicitly asking us to stop moving things. */
  get scenes() { return mqDesktop.matches && !mqReduce.matches; },
};

export function onBreakpoint(fn) {
  mqDesktop.addEventListener('change', fn);
  mqReduce.addEventListener('change', fn);
}
