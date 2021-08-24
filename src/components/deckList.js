import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {autoParse} from 'mtg-decklist-parser';
import {createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {DeckModel} from 'models/deck';
import {
  CARD_WIDTH,
  CARD_WIDTH_MOBILE,
  CARD_HEIGHT,
  CARD_HEIGHT_MOBILE,
  MOBILE_WIDTH,
  KEY_CODES,
} from 'helpers/constants';


const [SET_DECKLIST, setDecklist] = createAction('SET_DECKLIST', (type, scryfall, parser) => ({type, scryfall, parser}));
const [SET_SOURCE, setSource] = createAction('SET_SOURCE');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');


export class DeckList extends StateElement {
  static get properties() {
    return {
      src: {
        type: String,
      },
    };
  }

  static get styles() {
    return css`
      [part="container"] {

      }
    `;
  }

  constructor() {
    super();

    const state = {
      decklist: undefined,
      source: undefined,
      fetched: false,
    };

    const handlers = {
      [SET_DECKLIST]: (state, action) => ({
        ...state,
        decklist: DeckModel.fromApi(action.scryfall, action.parser),
      }),
      [SET_SOURCE]: (state, action) => ({
        ...state,
        source: action.value,
      }),
      [SET_FETCHED]: (state, action) => ({
        ...state,
        fetched: action.value,
      }),
    };

    this.createReducer(state, handlers);
    this.fetchCards(this.textContent);
  }

  set src(newVal) {
    if (newVal !== this.state.source) {
      this.fetchExternalList(newVal);
    }
  }

  fetchExternalList(src) {
    fetch(src)
      .then(resp => {
        if (resp.status !== 200) {
          return;
        }

        return resp.text();
      })
      .then(resp => {
        if (!resp) {
          return;
        }

        this.dispatch(setSource(src), () => this.fetchCards(resp));
      });
  }

  fetchCards(rawDecklist) {
    const list = rawDecklist.trim() ? autoParse(rawDecklist) : undefined;

    if (!list?.deck.length) {
      return;
    }

    let allCards = list.deck
      .concat(list.sideboard, list.commander, list.companion)
      .filter(x => !!x);

    allCards = [...new Map(allCards.map(x => [x.name, x])).values()];

    const scryfallQuery = {
      identifiers: allCards.map(x => {
        if (x.mtgoID) {
          return {
            mtgo_id: x.mtgoID,
          };
        } else if (x.collectors && x.set) {
          return {
            set: x.set,
            collector_number: x.collectors.toString(),
          };
        } else if (x.set) {
          return {
            name: x.name,
            set: x.set,
          };
        }

        return {
          name: x.name,
        };
      }),
    };

    fetch(`${this.apiRoot}cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scryfallQuery),
    }).then(resp => resp.json())
      .then(resp => {
        if (resp.code === 'bad_request') {
          console.error(resp.details);
          this.dispatch(setFetched(true));
          this.emitEvent('fetchError');

          return;
        }

        this.dispatch(setDecklist(resp.data, list));
        this.dispatch(setFetched(true));
        this.emitEvent('fetchList');

        // TODO: set and use CardCache
      });
  }

  render() {
    if (!this.state.fetched) {
      return html`
        <p>LOADING</p>
      `;
    }

    return html`
      <div part='container'>

      </div>
    `;
  }
}