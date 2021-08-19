import {createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {SearchModel} from 'models/search';
import {CardModel} from 'models/card';


const [SET_CARD_INFO, setCardInfo] = createAction('SET_CARD_INFO');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [UPDATE_SEARCH, updateSearch] = createAction('UPDATE_SEARCH');


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

  connectedCallback() {
    super.connectedCallback();
  }

  set name(newVal) {
    if (newVal !== this.state.search.fuzzy) {
      this.dispatch(updateSearch({
        ...this.state.search,
        fuzzy: newVal,
      }));
    }
  }

  set set(newVal) {
    if (newVal !== this.state.search.set) {
      this.dispatch(updateSearch({
        ...this.state.search,
        set: newVal,
      }));
    }
  }

  set collector(newVal) {
    if (newVal !== this.state.search.collector) {
      this.dispatch(updateSearch({
        ...this.state.search,
        collector: newVal,
      }));
    }
  }

  get displayImages() {
    return !this.face ? this.state.cardInfo.images : this.state.cardInfo.images.slice(this.face - 1, this.face);
  }

  fetchCard() {
    if (this.state.fetched) {
      return;
    }

    if (CardCache.has(this.state.search)) {
      const info = CardCache.get(this.state.search);

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

          CardCache.set(this.state.search, info);

          this.dispatch(setCardInfo(info));
          this.emitEvent('fetchCard');
        });
    }

    this.dispatch(setFetched());
  }

  render() {
    throw new Error('NotImplementedError');
  }
}