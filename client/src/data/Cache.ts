/**
 * Get data from the cache if it exists
 * @param key  The key to get from the cache
 * @returns  The cached data or null if it doesn't exist
 */
export function getCache(key: string) {
  if (typeof window === "undefined") return null;

  const cachedData = localStorage.getItem(key);
  if (!cachedData) {
    return null;
  }

  return JSON.parse(cachedData);
}

/**
 * Set data in the client local storage cache
 * @param key  The key to set in the cache
 * @param data  The data to set in the cache
 */
export function setCache(key: string, data: any) {
  if (typeof window !== "undefined")
    localStorage.setItem(key, JSON.stringify(data));
}
