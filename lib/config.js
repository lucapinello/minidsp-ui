/**
 * Retrieves a value from localStorage if available.
 * Returns undefined (Optional.none) if running server-side or key not found.
 * 
 * @param {string} key - The localStorage key to retrieve
 * @returns {string|undefined} The stored value or undefined (Optional.none)
 */
const getLocalStorage = (key) => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return undefined; // Optional.none
};

/**
 * Retrieves a configuration value following a priority order.
 * Uses a Swift-like Optional pattern where undefined represents Optional.none.
 * 
 * Priority order:
 * 1. Local storage (if in browser and localStorageKey provided)
 * 2. Environment variables (NEXT_PUBLIC_*)
 * 3. config.json override file
 * 4. config.default.json
 * 5. Returns undefined (Optional.none) if not found
 * 
 * @param {string} path - Dot-notation path to configuration value (e.g. 'minidsp.api_url')
 * @param {string} [localStorageKey] - Optional localStorage key to check first
 * @returns {any|undefined} The configuration value or undefined (Optional.none)
 * 
 * @example
 * // Returns undefined (Optional.none) for missing paths
 * const missing = getConfig('nonexistent.path');
 * 
 * // Can be used with optional chaining
 * const value = getConfig('some.path')?.toLowerCase();
 */
const getConfig = (path, localStorageKey = null) => {
  // 1. Try localStorage if a key is provided
  if (localStorageKey) {
    const stored = getLocalStorage(localStorageKey);
    if (stored !== undefined) return stored;
  }

  // 2. Try environment variables
  const envKey = `NEXT_PUBLIC_${path.toUpperCase().replace(/\./g, '_')}`;
  const envValue = process.env[envKey];
  if (envValue !== undefined) return envValue;

  // 3. Try config.json override
  try {
    const config = require('../config.json');
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (value !== undefined) return value;
  } catch (e) {
    // Fall through to default config
  }

  // 4. Try config.default.json
  try {
    const defaultConfig = require('../config.default.json');
    const value = path.split('.').reduce((obj, key) => obj?.[key], defaultConfig);
    if (value !== undefined) return value;
  } catch (e) {
    // Fall through to undefined
  }

  // 5. Return undefined (equivalent to Optional.none in Swift)
  return undefined;
};

export { getConfig }; 