import {LitElement, html, css} from 'lit-element';
import classNames from 'classnames';
import {createReducer, createAction} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';


const [SET_CARD_URLS, setCardUrls] = createAction('SET_CARD_URLS');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [UPDATE_SEARCH, updateSearch] = createAction('UPDATE_SEARCH');
const [UPDATE_DISPLAY, updateDisplay] = createAction('UPDATE_DISPLAY');
const [HIDE_CARD, hideCard] = createAction('HIDE_CARD');


export class CardLinker extends LitElement {
  static get properties() {
    return { 
      name: {
        type: String,
      },
      set: {
        type: String,
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
        display: none;
      }

      .card-linker__container--open {
        display: flex;
      }

      .card-linker__container--bottom {
        top: 100%;
      }

      .card-linker__container--top {
        bottom: 100%;
      }

      .card-linker__container--left {
        transform: translateX(-100%);
      }

      .card-linker__container--wide {
        width: 446px;
      }

      .card-linker__image {
        display: block;
        max-width: 100%;
      }
    `;
  }

  constructor() {
    super();

    const searchTerm = this.getAttribute('name') || this.textContent;
    const searchSet = this.getAttribute('set');

    this.state = {
      images: [],
      scryfallUrl: `https://scryfall.com/search?q="${encodeURIComponent(searchTerm)}"`,
      fetched: false,
      display: false,
      cardX: 0,
      bottom: true,
      right: true,
      search: {
        fuzzy: searchTerm,
        set: searchSet,
      },
    };

    const reducer = createReducer({...this.state}, {
      [SET_CARD_URLS]: (state, action) => ({
        ...state,
        images: action.value.images,
        scryfallUrl: action.value.scryfall,
      }),
      [SET_FETCHED]: state => ({
        ...state,
        fetched: true,
      }),
      [UPDATE_SEARCH]: (state, action) => ({
        ...state,
        search: {...action.value},
        fetched: false,
      }),
      [UPDATE_DISPLAY]: (state, action) => ({
        ...state,
        display: action.value.display,
        cardX: action.value.cardX,
        bottom: action.value.bottom,
        right: action.value.right,
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

    if (CardCache.has(this.state.search)) {
      const urls = CardCache.get(this.state.search);

      this.dispatch(setCardUrls(urls));
    } else {
      const searchParams = new URLSearchParams();
      
      Object.keys(this.state.search).forEach(key => {
        if (this.state.search[key]) {
          searchParams.set(key, this.state.search[key]);
        }
      });

      fetch(`https://api.scryfall.com/cards/named?${searchParams.toString()}`)
        .then(resp => resp.json())
        .then(resp => {
          const urls = {
            images: DOUBLE_SIDED_LAYOUTS.includes(resp.layout) ?
              resp.card_faces.map(face => face.image_uris.normal) :
              [resp.image_uris.normal],
            scryfall: resp.scryfall_uri,
          };

          CardCache.set(this.state.search, urls);

          this.dispatch(setCardUrls(urls));
          this.emitEvent('fetchCard');
        });
    }

    this.dispatch(setFetched());
  }

  displayCard(cardX, bottom = true, right = true) {
    this.dispatch(updateDisplay({
      display: true,
      cardX,
      bottom,
      right,
    }));
    this.emitEvent('displayCard');
  }

  hideCard() {
    this.dispatch(hideCard());
    this.emitEvent('hideCard');
  }

  mouseenter(e) {
    const OFFSET = 8;
    const bounds = this.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;

    const containerStyles = window.getComputedStyle(this.shadowRoot.querySelector('.card-linker__container'));
    const width = containerStyles.getPropertyValue('width');
    const height = containerStyles.getPropertyValue('height');
    const overflowRight = e.clientX + parseInt(width) > window.innerWidth;
    const overflowBottom = e.clientY + parseInt(height) > window.innerHeight;

    this.fetchCard();
    this.displayCard(mouseX + (overflowRight ? OFFSET : -OFFSET), !overflowBottom, !overflowRight);
  }

  mouseleave() {
    this.hideCard();
  }

  render() {
    const containerClasses = classNames('card-linker__container', {
      'card-linker__container--open': this.state.display && !!this.state.images.length,
      'card-linker__container--bottom': this.state.bottom,
      'card-linker__container--top': !this.state.bottom,
      'card-linker__container--left': !this.state.right,
      'card-linker__container--wide': this.state.images.length > 1,
    });

    return html`
      <a href=${this.state.scryfallUrl}
        target='_blank'
        rel='nofollow noreferrer noopener'
        class='card-linker__link'
        part='link'
        @mouseenter=${this.mouseenter}
        @mouseleave=${this.mouseleave}>
        <slot></slot>
        <div class=${containerClasses} part='container' style='left: ${this.state.cardX};'>
          ${this.state.images.map(image => html`<img class='card-linker__image' part='image' src='${image}' />`)}
        </div>
      </a>
    `;
  }
}