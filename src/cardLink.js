import {html, css} from 'lit-element';
import classNames from 'classnames';
import {createReducer, createAction, StateElement} from 'helpers/store';
import {CardCache} from 'helpers/cache';
import {SearchModel} from 'models/search';
import {CardModel} from 'models/card';


const [SET_CARD_INFO, setCardInfo] = createAction('SET_CARD_INFO');
const [SET_FETCHED, setFetched] = createAction('SET_FETCHED');
const [UPDATE_SEARCH, updateSearch] = createAction('UPDATE_SEARCH');
const [UPDATE_DISPLAY, updateDisplay] = createAction('UPDATE_DISPLAY');
const [HIDE_CARD, hideCard] = createAction('HIDE_CARD');

const CARD_WIDTH = 223;

export class CardLink extends StateElement {
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

      .card-link__link {
        position: relative;
      }

      .card-link__container {
        z-index: 99;
        position: fixed;
        width: ${CARD_WIDTH}px;
        height: 310px;
        display: none;
      }

      .card-link__container--open {
        display: flex;
        flex-wrap: wrap;
      }

      .card-link__link:hover .card-link__container--open {
        animation: fadein 83ms ease-out;
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
        width: ${CARD_WIDTH * 2}px;
      }

      .card-link__image {
        display: block;
        max-width: 100%;
        height: 100%;
      }

      .card-link__prices {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        width: 100%;
        background: #fff;
      }

      .card-link__price {
        width: 100%;
        text-align: center;
      }

      .card-link__price:first-child {
        text-align: right;
      }

      .card-link__price:last-child {
        text-align: left;
      }

      .card-link__price > a {
        display: block;
        padding: 6px 8px;
        font-size: 80%;
        text-decoration: none;
      }

      .card-link__price > a:hover {
        text-decoration: underline;
      }
    `;
  }

  constructor() {
    super();

    const searchTerm = this.getAttribute('name') || this.textContent;

    this.state = {
      cardInfo: new CardModel({
        url: `https://scryfall.com/search?q="${encodeURIComponent(searchTerm)}"`,
      }),
      fetched: false,
      display: false,
      cardX: 0,
      cardY: 0,
      bottom: true,
      right: true,
      search: new SearchModel({
        fuzzy: searchTerm,
        set: this.getAttribute('set'),
        collector: this.getAttribute('collector'),
      }),
    };

    this.reducer = createReducer({...this.state}, {
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
    const height = containerStyles.getPropertyValue('height');
    const overflowRight = e.clientX > window.innerWidth / 2;
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
    const displayImages = !this.face ? this.state.cardInfo.images : this.state.cardInfo.images.slice(this.face - 1, this.face);
    
    const containerClasses = classNames('card-link__container', {
      'card-link__container--open': this.state.display && !!displayImages.length,
      'card-link__container--bottom': this.state.bottom,
      'card-link__container--top': !this.state.bottom,
      'card-link__container--left': !this.state.right,
      'card-link__container--wide': displayImages.length > 1,
    });

    return html`
      <a href=${this.state.cardInfo.url}
        target='_blank'
        rel='nofollow noreferrer noopener'
        class='card-link__link'
        part='link'
        @mouseenter=${this.mouseEnterEvent}
        @mouseleave=${this.mouseLeaveEvent}>
        <slot></slot>
        <div class=${containerClasses} part='container' style='left: ${this.state.cardX}px; top: ${this.state.cardY}px;'>
          ${displayImages.map(image => html`<img class='card-link__image' part='image' src='${image}' />`)}
          ${this.priceInfo ? html`
            <ul class='card-link__prices' part='price-list'>
              ${this.state.cardInfo.prices().map(price => price.price ? html`
                <li class='card-link__price' part='price-item'>
                  <a part='price-link' href='${price.url}' target='_blank' rel='nofollow noreferrer noopener'>
                    ${price.symbol}${price.price}
                  </a>
                </li>` : null)}
            </ul>` : null}
        </div>
      </a>
    `;
  }
}