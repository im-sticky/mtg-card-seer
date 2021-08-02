import {LitElement, html, css} from 'lit-element';
import classNames from 'classnames';
import {createReducer, createAction} from 'helpers/store';
import {CardCache} from 'helpers/cache';


const [SET_CARD_URLS, setCardUrls] = createAction('SET_CARD_URLS');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [UPDATE_SEARCH_TERM, updateSearchTerm] = createAction('UPDATE_SEARCH_TERM');
const [UPDATE_DISPLAY, updateDisplay] = createAction('UPDATE_DISPLAY');
const [HIDE_CARD, hideCard] = createAction('HIDE_CARD');


export class CardLinker extends LitElement {
  static get properties() {
    return { 
      name: {
        type: String,
      },
      linkClass: {
        type: String,
        attribute: 'link-class',
      },
      cardClass: {
        type: String,
        attribute: 'card-class',
      },
    };
  }

  static get styles() {
    return css`
      .card-linker__link {
        position: relative;
      }

      .card-linker__container {
        z-index: 99;
        position: absolute;
        width: 223px;
        height: 310px;
      }

      .card-linker__img {
        max-width: 100%;
      }
    `;
  }

  constructor() {
    super();

    const searchTerm = this.getAttribute('name') || this.textContent;

    this.state = {
      imageUrl: undefined,
      scryfallUrl: `https://scryfall.com/search?q="${encodeURIComponent(searchTerm)}"`,
      fetched: false,
      display: false,
      cardX: 0,
      searchTerm,
    };

    const reducer = createReducer({...this.state}, {
      [SET_CARD_URLS]: (state, action) => ({
        ...state,
        imageUrl: action.value.image,
        scryfallUrl: action.value.scryfall,
      }),
      [SET_FETCHED]: state => ({
        ...state,
        fetched: true,
      }),
      [UPDATE_SEARCH_TERM]: (state, action) => ({
        ...state,
        searchTerm: action.value,
        fetched: CardCache.has(action.value),
      }),
      [UPDATE_DISPLAY]: (state, action) => ({
        ...state,
        display: action.value.display,
        cardX: action.value.cardX,
      }),
      [HIDE_CARD]: state => ({
        ...state,
        display: false,
      })
    });

    this.dispatch = action => {
      this.state = reducer(this.state, action);
      this.requestUpdate();
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  set name(newVal) {
    if (newVal !== this.state.searchTerm) {
      this.dispatch(updateSearchTerm(newVal));
    }
  }

  emitEvent(eventName, initOptions) {
    this.dispatchEvent(new Event(eventName, Object.assign({
      bubbles: true,
      composed: true,
    }, initOptions)));
  }

  fetchCard() {
    if (this.state.fetched) {
      return;
    }

    if (CardCache.has(this.state.searchTerm)) {
      const urls = CardCache.get(this.state.searchTerm);

      this.dispatch(setCardUrls(urls));
    } else {
      fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(this.state.searchTerm)}`)
        .then(resp => resp.json())
        .then(resp => {
          const urls = {
            image: resp.image_uris.normal,
            scryfall: resp.scryfall_uri,
          };

          CardCache.set(this.state.searchTerm, urls);

          this.dispatch(setCardUrls(urls));
          this.emitEvent('fetchCard');
        });
    }

    this.dispatch(setFetched());
  }

  displayCard(cardX, cardY) {
    this.dispatch(updateDisplay({
      display: true,
      cardX,
    }));
    this.emitEvent('displayCard');
  }

  hideCard() {
    this.dispatch(hideCard());
    this.emitEvent('hideCard');
  }

  mouseenter(e) {
    const bounds = this.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    this.fetchCard();
    this.displayCard(mouseX, mouseY);
  }

  mouseleave() {
    this.hideCard();
  }

  render() {
    return html`
      <a href=${this.state.scryfallUrl}
        target='_blank'
        rel='nofollow noreferrer noopener'
        class=${classNames('card-linker__link', this.linkClass)}
        @mouseenter=${this.mouseenter}
        @mouseleave=${this.mouseleave}>
        <slot></slot>
        ${this.state.display && !!this.state.imageUrl ?
          html`<div class=${classNames('card-linker__container', this.cardClass)} style='left: ${this.state.cardX};'>
            <img class='card-linker__img' src='${this.state.imageUrl}' />
          </div>` : null}
      </a>
    `;
  }
}