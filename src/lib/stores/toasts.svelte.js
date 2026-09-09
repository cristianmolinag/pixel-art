/**
 * Central toast notification store.
 *
 * Supports non-blocking, auto-dismissing toast messages.
 */

const DEFAULT_DURATION_MS = 2500;
const MAX_TOASTS = 3;

let nextId = 1;

class ToastsStore {
  items = $state([]);

  /**
   * Show a new toast message.
   *
   * @param {string} message
   * @param {object} [options={}]
   * @param {number} [options.duration=2500]
   * @returns {string} toast id
   */
  show(message, options = {}) {
    const id = String(nextId++);
    const duration = Number(options.duration ?? DEFAULT_DURATION_MS);

    this.items = [...this.items, { id, message }].slice(-MAX_TOASTS);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  /**
   * Remove a toast by id.
   *
   * @param {string} id
   */
  dismiss(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const toasts = new ToastsStore();
