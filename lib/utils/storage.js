/**
 * Safe wrapper for localStorage operations
 */
export const storage = {
  /**
   * Get a value from localStorage
   * @param {string} key - The key to get
   * @param {any} defaultValue - Value to return if key doesn't exist
   * @returns {any} The value or defaultValue if not found
   */
  get(key, defaultValue = undefined) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set a value in localStorage
   * @param {string} key - The key to set
   * @param {any} value - The value to store
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  remove(key) {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
}; 