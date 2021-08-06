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


export class CardLink extends LitElement {
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
    };
  }

  static get styles() {
    return css`
      .card-link__link {
        position: relative;
      }

      .card-link__container {
        z-index: 99;
        position: fixed;
        width: 223px;
        height: 310px;
        display: none;
      }

      .card-link__container--open {
        display: flex;
      }

      .card-link__container--bottom {
        transform: translateY(-1px);
      }

      .card-link__container--top {
        transform: translateY(-100%);
      }

      .card-link__container--left {
        transform: translateX(-100%);
      }

      .card-link__container--top.card-link__container--left {
        transform: translate3d(-100%, -100%, 0);
      }

      .card-link__container--bottom.card-link__container--left {
        transform: translate3d(-100%, -1px, 0);
      }

      .card-link__container--wide {
        width: 446px;
      }

      .card-link__image {
        display: block;
        max-width: 100%;
      }
    `;
  }

  constructor() {
    super();

    const searchTerm = this.getAttribute('name') || this.textContent;

    this.state = {
      images: [],
      scryfallUrl: `https://scryfall.com/search?q="${encodeURIComponent(searchTerm)}"`,
      fetched: false,
      display: false,
      cardX: 0,
      cardY: 0,
      bottom: true,
      right: true,
      search: {
        fuzzy: searchTerm,
        set: this.getAttribute('set'),
        collector: this.getAttribute('collector'),
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
        cardY: action.value.cardY,
        bottom: action.value.bottom,
        right: action.value.right,
      }),
      [HIDE_CARD]: state => ({
        ...state,
        display: false,
      })
    });

    // TODO: move into a base class
    this.dispatch = (action, callback) => {
      this.state = reducer(this.state, action);
      this.requestUpdate().then(updated => {
        if (updated && !!callback && typeof callback === 'function') {
          callback();
        }
      });
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

  set collector(newVal) {
    if (newVal !== this.state.search.collector) {
      this.dispatch(updateSearch({
        ...this.state.search,
        collector: newVal,
      }));
    }
  }

  apiRoot = 'https://api.scryfall.com/';

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

  displayCard(cardX, cardY, bottom = true, right = true) {
    this.dispatch(updateDisplay({
      display: true,
      cardX,
      cardY,
      bottom,
      right,
    }), () => this.emitEvent('displayCard'));
  }

  hideCard() {
    this.dispatch(hideCard(), () => this.emitEvent('hideCard'));
  }

  mouseEnterEvent(e) {
    const OFFSET = 8;
    const containerStyles = window.getComputedStyle(this.shadowRoot.querySelector('.card-link__container'));
    const width = containerStyles.getPropertyValue('width');
    const height = containerStyles.getPropertyValue('height');
    const overflowRight = e.clientX + parseInt(width) > window.innerWidth;
    const overflowBottom = e.clientY + parseInt(height) > window.innerHeight;
    let clientY;

    Array.prototype.slice.call(this.getClientRects()).some(rect => {
      if (e.clientY >= Math.round(rect.top) &&
          e.clientY <= Math.round(rect.bottom) &&
          e.clientX >= Math.round(rect.left) &&
          e.clientX <= Math.round(rect.right)) {
        clientY = rect.top + (overflowBottom ? 0 : rect.height);
        return true;
      }
    });

    this.fetchCard();
    this.displayCard(
      e.clientX + (overflowRight ? OFFSET : -OFFSET),
      clientY,
      !overflowBottom,
      !overflowRight
    );
  }

  mouseLeaveEvent(e) {
    this.hideCard();
  }

  render() {
    const containerClasses = classNames('card-link__container', {
      'card-link__container--open': this.state.display && !!this.state.images.length,
      'card-link__container--bottom': this.state.bottom,
      'card-link__container--top': !this.state.bottom,
      'card-link__container--left': !this.state.right,
      'card-link__container--wide': this.state.images.length > 1,
    });

    return html`
      <a href=${this.state.scryfallUrl}
        target='_blank'
        rel='nofollow noreferrer noopener'
        class='card-link__link'
        part='link'
        @mouseenter=${this.mouseEnterEvent}
        @mouseleave=${this.mouseLeaveEvent}
        @mousemove=${this.mouseMoveEvent}>
        <slot></slot>
        <div class=${containerClasses} part='container' style='left: ${this.state.cardX}px; top: ${this.state.cardY}px;'>
          ${this.state.images.map(image => html`<img class='card-link__image' part='image' src='${image}' />`)}
        </div>
      </a>
    `;
  }
}