import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {autoParse} from 'mtg-decklist-parser';
import {createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {DeckModel} from 'models/deck';
import {isTouchEvent} from 'helpers/utility';
import {
  MTGA_UNIQUE_SET_CODES,
  CARD_TYPE_ORDER,
  CARD_WIDTH,
  CARD_HEIGHT,
  MOBILE_WIDTH,
  KEY_CODES,
  EXPORT_MODE,
  CARD_BORDER_ROUNDING,
} from 'helpers/constants';

const NOTIFICATION_TIMING = 3000;

const [SET_DECKLIST, setDecklist] = createAction('SET_DECKLIST', (type, scryfall, parser) => ({type, scryfall, parser}));
const [SET_SOURCE, setSource] = createAction('SET_SOURCE');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [SET_PREVIEW, setPreview] = createAction('SET_PREVIEW');
const [SET_EXPORT_NOTIFICATION, setExportNotification] = createAction('SET_EXPORT_NOTIFICATION');
const [FLIP_PREVIEW, flipPreview] = createAction('FLIP_PREVIEW');

/**
 * Component for rendering entire decklists with an image preview.
 */
export class DeckList extends StateElement {
  static get properties() {
    return {
      format: {
        type: String,
      },
      heading: {
        type: String,
      },
      hideExport: {
        type: Boolean,
        attribute: 'hide-export',
      },
      hidePreview: {
        type: Boolean,
        attribute: 'hide-preview',
      },
      inlineSideboard: {
        type: Boolean,
        attribute: 'inline-sideboard',
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

      @keyframes fadeout {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      seer-loader {
        display: block;
      }

      [part="container"] {
        animation: fadein 83ms ease-out;
        max-width: 840px;
      }

      [part="header"] {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }

      [part="heading"] {
        margin: 0;
        padding-right: 1rem;
      }

      [part="format"] {
        font-size: 80%;
        font-style: italic;
      }

      .button {
        display: inline-block;
        border: none;
        padding: 0.5rem 1rem;
        background: #551a8b;
        color: #fff;
        font-size: 0.875rem;
        cursor: pointer;
        border-radius: 3px;
        appearance: none;
        transition: background 166ms ease-out;
      }

      .button--small {
        padding: 0.4rem 0.8rem;
        font-size: 0.75rem;
      }

      .button:hover,
      .button:focus {
        background: #343242;
      }

      [part="export"] + [part="export"] {
        margin-left: 0.5rem;
      }

      [part="export"]:first-of-type {
        margin-left: auto;
      }

      [part="export-notification"] {
        color: #75986E;
        font-size: 0.875rem;
        margin: 0 0 0 auto;
        padding: 8px 0;
        font-style: italic;
        animation: fadein 83ms cubic-bezier(0.25, 1, 0.5, 1),
          fadeout ${NOTIFICATION_TIMING / 2}ms linear ${NOTIFICATION_TIMING / 2}ms;
      }

      [part="export-notification"] + [part="export"] {
        margin-left: 1rem;
      }

      [part="body"] {
        column-count: 3;
      }

      [part="preview-container"] {
        position: relative;
        perspective: 1200px;
        width: ${CARD_WIDTH}px;
        height: ${CARD_HEIGHT}px;
      }

      [part="preview"] {
        width: 100%;
        height: 100%;
        background-image: url(https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card);
        background-size: 100% auto;
        background-repeat: no-repeat;
        position: relative;
        transition: transform 560ms ease-in-out;
        transform-style: preserve-3d;
        border-radius: ${CARD_BORDER_ROUNDING}px;
      }

      [part="preview"].flipped {
        transform: rotateY(180deg);
      }

      [part="preview-image"] {
        max-width: 100%;
        position: absolute;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      /* BUG: can't apply to backface or else it is hidden */
      [part="preview-image"]:first-child {
        border-radius: ${CARD_BORDER_ROUNDING}px;
      }

      [part="preview-image"] + [part="preview-image"] {
        transform: rotateY(180deg);
      }

      [part="flip-preview"] {
        position: absolute;
        z-index: 10;
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
      }

      [part="section"] {
        padding: 0.5rem;
        margin: 0;
        line-height: 1.5;
      }

      [part="section"]:not(.section--sideboard) {
        page-break-inside: avoid;
        break-inside: avoid-column;
        display: table;
      }

      .section--sideboard [part="section-title"] {
        padding: 0 0.5rem;
        column-span: all;
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
        border-top: 1px solid #551a8b;
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

  /**
   * Initializes component with state and reducer actions, as well as fetching the cards from scryfall.
   */
  constructor() {
    super();

    this.hidePreview = false;
    this.hideExport = false;
    this.inlineSideboard = false;

    const state = {
      decklist: undefined,
      parsedList: undefined,
      source: undefined,
      fetched: false,
      preview: undefined,
      exportNotification: undefined,
    };

    const handlers = {
      [SET_DECKLIST]: (state, action) => ({
        ...state,
        decklist: DeckModel.fromApi(action.scryfall, action.parser),
        parsedList: !this.hideExport ? action.parser : undefined,
      }),
      [SET_SOURCE]: (state, action) => ({
        ...state,
        source: action.value,
      }),
      [SET_FETCHED]: (state, action) => ({
        ...state,
        fetched: action.value,
      }),
      [SET_PREVIEW]: (state, action) => ({
        ...state,
        preview: action.value,
        flipPreview: false,
      }),
      [SET_EXPORT_NOTIFICATION]: (state, action) => ({
        ...state,
        exportNotification: action.value,
      }),
      [FLIP_PREVIEW]: state => ({
        ...state,
        flipPreview: !state.flipPreview,
      }),
    };

    this.createReducer(state, handlers);
    this.fetchCards(this.textContent);
  }

  /**
   * Setter for src attribute, will attempt to fetch external file.
   * @param {String} newVal New attribute value.
   */
  set src(newVal) {
    if (newVal !== this.state.source) {
      this.fetchExternalList(newVal);
    }
  }

  /**
   * Will fetch external file and then fetch from Scryfall API based on its contents.
   * @param {String} src File URL path.
   */
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

  /**
   * Fetches cards from scryfall API and sets decklist from those results.
   * @param {String} rawDecklist Raw newline delimited decklist string based ont MTGO or MTGA format.
   */
  fetchCards(rawDecklist) {
    const list = rawDecklist.trim() ? autoParse(rawDecklist) : undefined;

    if (!list?.deck.length) {
      return;
    }

    let allCards = list.deck
      .concat(list.sideboard, list.commander, list.companion)
      .filter(x => !!x);

    allCards = [...new Map(allCards.map(x => [x.name, x])).values()]
      .filter(x => !CardCache.has(CardCache.createKey(x.name, x.set, x.collectors)));

    // Split into multiple chunks to avoid scryfall api limit
    const CHUNK_SIZE = 75;
    const chunks = Math.ceil(allCards.length / CHUNK_SIZE);
    const queries = [];

    for (let i = 0; i < chunks; i++) {
      queries.push({
        identifiers: allCards
          .slice(CHUNK_SIZE * i, CHUNK_SIZE * (i + 1))
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

  /**
   * Sets a card to be seen in the preview.
   * @param {CardModel} card Card to set as preview.
   */
  displayPreview(card) {
    if (!this.hidePreview) {
      this.dispatch(setPreview(card), () => this.emitEvent('previewChange'));
    }
  }

  /**
   * Attempts to set the card as the preview based on the dispatched hover event.
   * @param {Event} e JS event dispatched from link.
   * @param {CardModel} card Card to set for preview.
   */
  handleMouseEnter(e, card) {
    if (isTouchEvent(e)) {
      e.preventDefault();
      return;
    }

    this.displayPreview(card);
  }

  /**
   * Attempts to set the card as the preview based on the dispatched touch event.
   * @param {Event} e JS event dispatched from link.
   * @param {CardModel} card Card to set for preview.
   */
  handleMobileTouch(e, card) {
    if (isTouchEvent(e)) {
      this.emitEvent('touchCard');

      if (this.state.preview?.name !== card.name && !this.hidePreview) {
        e.preventDefault();

        this.displayPreview(card);
      }
    }
  }

  /**
   * Attempts to set the card as the preview based on the dispatched keyboard event.
   * @param {Event} e JS event dispatched from link.
   * @param {CardModel} card Card to set for preview.
   */
  onTabFocusIn(e, card) {
    if (!isTouchEvent(e) && e.code === KEY_CODES.TAB) {
      this.displayPreview(card);
    }
  }

  /**
   * Exports the deck to a specific format based on the given mode.
   * @param {String} mode One of a constant value.
   */
  exportDeck(mode) {
    // IMPORTANT: new lines are intentional
    const toInfo = card => `${card.amount} ${card.name}\n`;
    let textDeck = '';

    if (mode === EXPORT_MODE.arena) {
      if (this.state.parsedList.commander) {
        textDeck += `Commander\n${toInfo(this.state.parsedList.commander)}\n`;
      } else if (this.state.parsedList.companion) {
        textDeck += `Companion\n${toInfo(this.state.parsedList.companion)}\n`;
      }

      textDeck += 'Deck\n';
    }

    this.state.parsedList.deck.forEach(x => textDeck += toInfo(x));

    if (this.state.parsedList.sideboard.length > 0) {
      if (mode === EXPORT_MODE.arena) {
        textDeck += '\nSideboard';
      }

      textDeck += '\n';
      this.state.parsedList.sideboard.forEach(x => textDeck += toInfo(x));
    }

    if (mode === EXPORT_MODE.mtgo && this.state.parsedList.commander) {
      textDeck += `\n${toInfo(this.state.parsedList.commander)}`;
    }

    switch (mode) {
      case EXPORT_MODE.mtgo:
        // eslint-disable-next-line no-case-declarations
        let download = document.createElement('a');

        download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textDeck));
        download.setAttribute('download', this.heading ? `${this.heading}.txt` : 'deck.txt');
        download.style.display = 'none';

        document.body.appendChild(download);
        download.click();
        document.body.removeChild(download);
        break;
      default:
        navigator.clipboard.writeText(textDeck.trim()).then(() => {
          this.dispatch(setExportNotification('Copied to clipboard'), () => setTimeout(() => this.dispatch(setExportNotification(undefined)), NOTIFICATION_TIMING));
        });
        break;
    }

    this.emitEvent('deckExported');
  }

  /**
   * Renders a section of cards within the decklist.
   * @param {DeckSectionModel} section Section of cards to render.
   * @param {String} classes Optional additional CSS classes to add to container element.
   * @returns {TemplateResult} LitHtml template.
   */
  renderDeckSection(section, classes = null) {
    if (!section) {
      return null;
    }

    return html`
      <dl part='section' class='${classes ?? ''}'>
        <dt part='section-title'>${section.title} (${section.cards.reduce((acc, x) => acc + x.amount, 0)})</dt>
        ${section.cards.map(card => html`
          <dd part='section-item'>
            ${card.amount}x <a
              href='${card.url}'
              target='_blank'
              rel='nofollow noreferrer noopener'
              part='link'
              @mouseenter=${e => this.handleMouseEnter(e, card)}
              @click=${e => this.handleMobileTouch(e, card)}
              @keyup=${e => this.onTabFocusIn(e, card)}>
              ${card.name}
            </a>
          </dd>
        `)}
      </dl>
    `;
  }

  /**
   * LitElement lifecycle method for rendering HTML to DOM.
   * @returns {TemplateResult} LitHtml template.
   */
  render() {
    if (!this.state.fetched) {
      return html`
        <seer-loader part='loader'></seer-loader>
      `;
    }

    return html`
      <div part='container'>
        ${this.heading || !this.hideExport ? html`
          <div part='header'>
            ${this.heading ? html`<h2 part='heading'>${this.heading}</h2>` : null}
            ${this.format ? html`<span part='format'>${this.format}</span>` : null}
            ${!this.hideExport ? html`
              ${this.state.exportNotification ? html`
                <p part='export-notification'>${this.state.exportNotification}</p>
              ` : null}
              <button type='button' part='export' class='button' @click=${() => this.exportDeck(EXPORT_MODE.arena)}>
                Arena
              </button>
              <button type='button' part='export' class='button' @click=${() => this.exportDeck(EXPORT_MODE.mtgo)}>
                MTGO
              </button>
            ` : null}
          </div>
        ` : null}

        <div part='body'>
          ${!this.hidePreview ? html`
            <div part='preview-container'>
              <div part='preview' class='${classMap({'flipped': this.state.flipPreview})}'>
              ${this.state.preview ? this.state.preview.faces.map(x => html`
                <img part='preview-image' src='${x.image}' alt='${x.name}' />
              `) : null}
              </div>
              ${this.state.preview?.faces.length > 1 ? html`
                <button type='button' part='flip-preview' class='button button--small' @click=${() => this.dispatch(flipPreview())}>
                  Flip
                </button>
              ` : null}
            </div>
          ` : null}

          ${this.renderDeckSection(this.state.decklist.commander)}
          ${this.renderDeckSection(this.state.decklist.companion)}
          ${CARD_TYPE_ORDER.map(type => this.renderDeckSection(this.state.decklist[type.toLowerCase()]))}
          ${this.state.decklist.sideboard && !this.inlineSideboard ? html`<hr part='separator' />` : null}
          ${this.renderDeckSection(this.state.decklist.sideboard, !this.inlineSideboard ? 'section--sideboard' : null)}
        </div>
      </div>
    `;
  }
}