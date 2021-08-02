const _cache = new Map();

export class CardCache {
  static normalizeKey(key) {
    return key.trim().toLowerCase().replace(/ /g, '-');
  }

  static set(key, value) {
    _cache.set(this.normalizeKey(key), value);
  }

  static get(key) {
    return _cache.get(this.normalizeKey(key));
  }

  static has(key) {
    return _cache.has(this.normalizeKey(key));
  }
}
