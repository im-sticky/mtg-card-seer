const _cache = new Map();

/**
 * Temporary cache intended for holding card object info and preventing redundant API calls.
 */
export class CardCache {
  /**
   * Sets a cache value at a specific key.
   * @param {SearchModel} search Model of the search used to retrieve the data from Scryfall.
   * @param {any} value Data to be cached.
   */
  static set(search, value) {
    _cache.set(search.cacheKey, value);
  }

  /**
   * Retrieves a cached value based on a Scryfall search.
   * @param {SearchModel} search Model of the Scryfall search to get cached data from.
   * @returns {any} The cached data.
   */
  static get(search) {
    return _cache.get(search.cacheKey);
  }

  /**
   * Checks if the cache has set data at a specific key.
   * @param {SearchModel} search Model of the Scryfall search to test.
   * @returns {Boolean} True if the cache contains the key.
   */
  static has(search) {
    return _cache.has(search.cacheKey);
  }
}
