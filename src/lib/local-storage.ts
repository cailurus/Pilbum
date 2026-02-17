/**
 * LocalStorage utilities with type safety and SSR support.
 */

/**
 * Safely read a value from localStorage with JSON parsing.
 * Returns fallback on SSR or parse errors.
 */
export function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely write a value to localStorage with JSON serialization.
 */
export function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
