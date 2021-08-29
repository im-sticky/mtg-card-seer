import MurmurHash3 from 'imurmurhash';

const _cache = new Map();

/**
 * Temporary cache intended for holding card object info and preventing redundant API calls.
 */
export class CardCache {
  /**
   * Sets a cache value at a specific key.
   * @param {Number} key Key to set cache at.
   * @param {any} value Data to be cached.
   */
  static set(key, value) {
    _cache.set(key, value);
  }

  /**
   * Retrieves a cached value based on a Scryfall search.
   * @param {Number} key Key to get from cache.
   * @returns {any} The cached data.
   */
  static get(key) {
    return _cache.get(key);
  }

  /**
   * Checks if the cache has set data at a specific key.
   * @param {Number} key Key to check for in cache.
   * @returns {Boolean} True if the cache contains the key.
   */
  static has(key) {
    return _cache.has(key);
  }

  /**
   * Creates a hashed key from a cards values to be used within the cache.
   * @param {String} name Name used for card.
   * @param {String} set Set of the card, optional.
   * @param {String|Number} collector Collector number of the card, optional.
   * @returns {Number} 32 bit hash.
   */
  static createKey(name, set = '', collector = '') {
    return MurmurHash3(name.toLowerCase())
      .hash(set?.toLowerCase() ?? '')
      .hash(collector?.toString() ?? '')
      .result();
  }
}
