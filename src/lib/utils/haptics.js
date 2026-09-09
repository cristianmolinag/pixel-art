/**
 * Haptic feedback utility.
 *
 * Wraps navigator.vibrate with feature detection so unsupported devices
 * or SSR environments silently skip the call.
 */

/**
 * Trigger a short vibration when the device supports it.
 *
 * @param {number} [ms=15]
 */
export function vibrate(ms = 15) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(ms);
  } catch {
    // Ignore devices that expose but reject vibration.
  }
}
