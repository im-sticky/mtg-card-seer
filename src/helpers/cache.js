const _cache = new Map();

export class CardCache {
  static normalizeKey(searchObj) {
    const setKey = searchObj.set ? `-${searchObj.set.trim().toLowerCase()}` : '';

    return searchObj.fuzzy.trim().toLowerCase().replace(/ /g, '_') + setKey;
  }

  static set(searchObj, value) {
    _cache.set(this.normalizeKey(searchObj), value);
  }

  static get(searchObj) {
    return _cache.get(this.normalizeKey(searchObj));
  }

  static has(searchObj) {
    return _cache.has(this.normalizeKey(searchObj));
  }
}
