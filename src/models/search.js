export class SearchModel {
  constructor({fuzzy, set, collector}) {
    this.fuzzy = fuzzy;
    this.set = set;
    this.collector = collector;
  }

  get cacheKey() {
    const setKey = this.appendKey(this.set);
    const collectorNum = this.appendKey(this.collector);

    return this.normalizeValue(this.fuzzy) + setKey + collectorNum;
  }

  normalizeValue(value) {
    switch (typeof value) {
      case 'string':
        return value.trim().toLowerCase().replace(/ /g, '_');
      default:
        return value;
    }
  }

  appendKey(value) {
    return value ? `-${this.normalizeValue(value)}` : '';
  }
}