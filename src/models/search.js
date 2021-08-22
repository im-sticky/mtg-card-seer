/**
 * Model used for building an object specific to fetching data from Scryfall and the local cache.
 */
export class SearchModel {
  /**
   * Initializes default search values.
   * @param {String} fuzzy Search term for specific card, does not need to be exact.
   * @param {String} set 3-5 letter code of card set.
   * @param {Number} collector Collector number of card within set.
   */
  constructor({fuzzy, set, collector}) {
    this.fuzzy = fuzzy;
    this.set = set;
    this.collector = collector;
  }

  /**
   * Getter for building key to be used within local cache based on current properties.
   * @returns {String} Normalized key for the cache.
   */
  get cacheKey() {
    const setKey = this.appendKey(this.set);
    const collectorNum = this.appendKey(this.collector);

    return this.normalizeValue(this.fuzzy) + setKey + collectorNum;
  }

  /**
   * Creates a lowercase dash separated value based on a given value.
   * @param {any} value Value to create normalized string for.
   * @returns {String} Normalized string.
   */
  normalizeValue(value) {
    switch (typeof value) {
      case 'string':
        return value.trim().toLowerCase().replace(/ /g, '_');
      default:
        return value;
    }
  }

  /**
   * Creates a normalized string to be appended to another.
   * @param {any} value Value to be appended to a list of normalized values.
   * @returns {any} Normalized value preceded by a dash.
   */
  appendKey(value) {
    return value ? `-${this.normalizeValue(value)}` : '';
  }
}