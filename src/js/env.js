/* One place that decides how much motion this device should be asked
 * to do. Everything else asks here rather than sniffing on its own. */

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqDesktop = window.matchMedia('(min-width: 1100px)');

export const env = {
  get reduced() { return mqReduce.matches; },
  /* Scroll-driven scenes are for pointer desktops that are not
   * explicitly asking us to stop moving things. */
  get scenes() { return mqDesktop.matches && !mqReduce.matches; },
};
