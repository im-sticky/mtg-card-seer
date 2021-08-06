const _cache = new Map();

export class CardCache {
  static set(search, value) {
    _cache.set(search.cacheKey, value);
  }

  static get(search) {
    return _cache.get(search.cacheKey);
  }

  static has(search) {
    return _cache.has(search.cacheKey);
  }
}
