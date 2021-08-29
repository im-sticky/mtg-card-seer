import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {autoParse} from 'mtg-decklist-parser';
import {createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {DeckModel} from 'models/deck';
import {
  MTGA_UNIQUE_SET_CODES,
  CARD_TYPE_ORDER,
  CARD_WIDTH,
  CARD_HEIGHT,
  MOBILE_WIDTH,
  KEY_CODES,
} from 'helpers/constants';


const [SET_DECKLIST, setDecklist] = createAction('SET_DECKLIST', (type, scryfall, parser) => ({type, scryfall, parser}));
const [SET_SOURCE, setSource] = createAction('SET_SOURCE');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');


export class DeckList extends StateElement {
  static get properties() {
    return {
      title: {
        type: String,
      },
      src: {
        type: String,
      },
    };
  }

  static get styles() {
    return css`
      @keyframes fadein {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      seer-loader {
        display: block;
      }

      [part="container"] {
        animation: fadein 83ms ease-out;
        max-width: 840px;
      }

      [part="title"] {
        text-align: center;
        margin: 0 0 1rem 0;
      }

      [part="body"] {
        column-count: 3;
      }

      [part="preview"] {
        width: ${CARD_WIDTH};
        height: ${CARD_HEIGHT};
        background-image: url(https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card);
        background-size: 100% auto;
        background-repeat: no-repeat;
      }

      [part="preview-image"] {
        width: 100%;
        height: 100%;
      }

      [part="section"] {
        page-break-inside: avoid;
        break-inside: avoid-column;
        display: table;
        padding: 0.5rem;
        margin: 0;
        line-height: 1.5;
      }

      [part="section-title"] {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      [part="section-item"] {
        margin: 0;
      }

      [part="separator"] {
        column-span: all;
        border-top: 1px solid #000;
      }

      @media screen and (max-width: ${MOBILE_WIDTH - 1}px) {
        [part="body"] {
          column-count: 2;
        }
      }

      @media screen and (max-width: 540px) {
        [part="body"] {
          column-count: 1;
        }

        [part="preview"] {
          margin: 0px auto;
        }
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

    // Split into multiple chunks to avoid scryfall api limit
    const CHUNK_SIZE = 75;
    const chunks = Math.ceil(allCards.length / CHUNK_SIZE);
    const queries = [];

    for (let i = 0; i < chunks; i++) {
      queries.push({
        identifiers: allCards
          .slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1))
          .filter(x => !CardCache.has(CardCache.createKey(x.name, x.set, x.collectors)))
          .map(x => {
            // Note: Scryfall doesn't seem to support all mtgo ids so avoid using those
            // Note: MTGA Dominaria set has a unique set code that Scryfall does not handle properly.
            if (x.collectors && x.set && !MTGA_UNIQUE_SET_CODES.includes(x.set.toUpperCase())) {
              return {
                set: x.set,
                collector_number: x.collectors.toString(),
              };
            } else if (x.set && !MTGA_UNIQUE_SET_CODES.includes(x.set.toUpperCase())) {
              return {
                name: x.name,
                set: x.set,
              };
            }

            return {
              name: x.name,
            };
          }),
      });
    }

    Promise.all(queries.map(q => fetch(`${this.apiRoot}cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(q),
    }).then(resp => resp.json())))
      .then(responses => {
        const errors = responses.filter(r => r.code === 'bad_request');

        if (errors.length > 0) {
          errors.forEach(err => console.error(err.details));
          this.dispatch(setFetched(true));
          this.emitEvent('fetchError');

          return;
        }

        const data = responses.map(r => r.data).flat();

        responses.map(r => r.not_found).flat().forEach(x => console.error('Did not find results for: ', x));

        this.dispatch(setDecklist(data, list));
        this.dispatch(setFetched(true));
        this.emitEvent('fetchList');
      });
  }

  renderDeckSection(section, count = true) {
    if (!section) {
      return null;
    }

    return html`
      <dl part='section'>
        <dt part='section-title'>${section.title}${count ? ` (${section.cards.length})` : null}</dt>
        ${section.cards.map(card => html`
          <dd part='section-item'>
            ${card.amount}x <a href='${card.url}' target='_blank' rel='nofollow noreferrer noopener'>${card.name}</a>
          </dd>
        `)}
      </dl>
    `;
  }

  render() {
    if (!this.state.fetched) {
      return html`
        <seer-loader></seer-loader>
      `;
    }

    return html`
      <div part='container'>
        ${this.title ? html`<h2 part='title'>${this.title}</h2>` : null}
        <div part='body'>
          <div part='preview'>
            ${this.state.previewImage ? html`<img part='preview-image' src='${this.state.previewImage}' alt='${this.state.previewName}' />`: null}
          </div>

          ${this.renderDeckSection(this.state.decklist.commander, false)}
          ${this.renderDeckSection(this.state.decklist.companion, false)}
          ${CARD_TYPE_ORDER.map(type => this.renderDeckSection(this.state.decklist[type.toLowerCase()]))}
          ${this.state.decklist.sideboard ? html`<hr part='separator' />` : null}
          ${this.renderDeckSection(this.state.decklist.sideboard, false)}
        </div>
      </div>
    `;
  }
}