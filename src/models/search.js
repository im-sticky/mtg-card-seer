import {CardCache} from 'helpers/cache';

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
    return CardCache.createKey(this.fuzzy, this.set, this.collector);
  }
}