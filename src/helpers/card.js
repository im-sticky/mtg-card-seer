import {createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {SearchModel} from 'models/search';
import {CardModel} from 'models/card';

const [SET_CARD_INFO, setCardInfo] = createAction('SET_CARD_INFO');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [UPDATE_SEARCH, updateSearch] = createAction('UPDATE_SEARCH');


/**
 * Class intended to be inherited by individual card based components.
 * Contains methods for fetching from the Scryfall API and handling local state.
 */
export class Card extends StateElement {
  static get properties() {
    return {
      name: {
        type: String,
      },
      set: {
        type: String,
      },
      collector: {
        type: Number,
      },
      face: {
        type: Number,
      },
      priceInfo: {
        type: Boolean,
        attribute: 'price-info',
      },
    };
  }

  /**
   * Takes a state and reducer object and initializes reducer.
   * @param {Object} additionalState Additional state to be included with the base state values.
   * @param {Object} reducerHandlers Additional reducer handlers to be included with the base handlers.
   */
  constructor(additionalState, reducerHandlers) {
    super();

    const searchTerm = this.getAttribute('name') || this.textContent;

    const state = Object.assign({
      fetched: false,
      cardInfo: new CardModel({
        url: `https://scryfall.com/search?q="${encodeURIComponent(searchTerm)}"`,
      }),
      search: new SearchModel({
        fuzzy: searchTerm,
        set: this.getAttribute('set'),
        collector: this.getAttribute('collector'),
      }),
    }, additionalState);

    const handlers = Object.assign({
      [SET_CARD_INFO]: (state, action) => ({
        ...state,
        cardInfo: new CardModel({...action.value}),
      }),
      [SET_FETCHED]: state => ({
        ...state,
        fetched: true,
      }),
      [UPDATE_SEARCH]: (state, action) => ({
        ...state,
        search: new SearchModel({...action.value}),
        fetched: false,
      }),
    }, reducerHandlers);

    this.createReducer(state, handlers);
  }

  /**
   * Setter for updating state from new name param value.
   * @param {String} newVal New value for param.
   */
  set name(newVal) {
    if (newVal !== this.state.search.fuzzy) {
      this.dispatch(updateSearch({
        ...this.state.search,
        fuzzy: newVal,
      }));
    }
  }

  /**
   * Setter for updating state from new set param value.
   * @param {String} newVal New value for param.
   */
  set set(newVal) {
    if (newVal !== this.state.search.set) {
      this.dispatch(updateSearch({
        ...this.state.search,
        set: newVal,
      }));
    }
  }

  /**
   * Setter for updating state from new collector param value.
   * @param {String} newVal New value for param.
   */
  set collector(newVal) {
    if (newVal !== this.state.search.collector) {
      this.dispatch(updateSearch({
        ...this.state.search,
        collector: newVal,
      }));
    }
  }

  /**
   * Getter for currently available card faces based on specified card faces.
   * @returns {Array} Available card faces.
   */
  get displayFaces() {
    return !this.face ? this.state.cardInfo.faces : this.state.cardInfo.faces.slice(this.face - 1, this.face);
  }

  /**
   * Method for retrieving card data from Scryfall API.
   * Checks first if card has already been fetched or if it exists in the cache.
   */
  fetchCard() {
    if (this.state.fetched) {
      return;
    }

    if (CardCache.has(this.state.search.cacheKey)) {
      const info = CardCache.get(this.state.search.cacheKey);

      this.dispatch(setCardInfo(info));
    } else {
      let endpoint = 'cards/';

      if (this.state.search.set && this.state.search.collector) {
        endpoint += `${this.state.search.set}/${this.state.search.collector}`;
      } else {
        const searchParams = new URLSearchParams();

        Object.keys(this.state.search).forEach(key => {
          if (this.state.search[key]) {
            searchParams.set(key, this.state.search[key]);
          }
        });

        endpoint += `named?${searchParams.toString()}`;
      }

      fetch(`${this.apiRoot}${endpoint}`)
        .then(resp => resp.json())
        .then(resp => {
          if (resp.status === 404) {
            console.error(resp.details);
            this.emitEvent('fetchError');

            return;
          }

          const info = CardModel.fromApi(resp);

          CardCache.set(this.state.search.cacheKey, info);

          this.dispatch(setCardInfo(info));
          this.emitEvent('fetchCard');
        });
    }

    this.dispatch(setFetched());
  }

  /**
   * LitElement lifecycle method. To be overwritten in sub class or throws error.
   */
  render() {
    throw new Error('NotImplementedError');
  }
}