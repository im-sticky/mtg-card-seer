import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {createAction} from 'helpers/store';
import {Card} from 'helpers/card';
import {
  CARD_WIDTH,
  CARD_WIDTH_MOBILE,
  CARD_HEIGHT,
  CARD_HEIGHT_MOBILE,
  MOBILE_WIDTH,
  KEY_CODES,
} from 'helpers/constants';
import {isTouchEvent} from 'helpers/utility';


const [UPDATE_DISPLAY, updateDisplay] = createAction('UPDATE_DISPLAY');
const [HIDE_CARD, hideCard] = createAction('HIDE_CARD');


export class CardLink extends Card {
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

      [part="link"] {
        position: relative;
      }

      .card-link__container {
        z-index: 99;
        position: fixed;
        width: ${CARD_WIDTH}px;
        height: ${CARD_HEIGHT}px;
        display: none;
      }

      .card-link__container--open {
        display: flex;
        flex-wrap: wrap;
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

      [part="image"] {
        display: block;
        max-width: 100%;
        height: 100%;
      }

      [part="price-list"] {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        width: 100%;
        background: #fff;
      }

      [part="price-item"] {
        width: 100%;
        text-align: center;
      }

      [part="price-item"]:first-child {
        text-align: right;
      }

      [part="price-item"]:last-child {
        text-align: left;
      }

      [part="price-link"] {
        display: block;
        padding: 6px 8px;
        font-size: 80%;
        text-decoration: none;
      }

      [part="price-link"]:hover {
        text-decoration: underline;
      }


      @media screen and (max-width: ${MOBILE_WIDTH - 1}px) {
        .card-link__container {
          width: ${CARD_WIDTH_MOBILE}px;
          height: ${CARD_HEIGHT_MOBILE}px;
        }

        .card-link__container--wide {
          width: ${CARD_WIDTH_MOBILE * 2}px;
        }
      }
    `;
  }

  constructor() {
    super({
      display: false,
      cardX: 0,
      cardY: 0,
      bottom: true,
      right: true,
    }, {
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
      }),
    });
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

  getCardPositions(event, clientPositionOverride = null) {
    const OFFSET = 8;
    const containerStyles = window.getComputedStyle(this.shadowRoot.querySelector('.card-link__container'));
    const height = containerStyles.getPropertyValue('height');
    const overflowRight = event.clientX > window.innerWidth / 2;
    const overflowBottom = event.clientY + parseInt(height) + this.offsetHeight > window.innerHeight;
    let clientX = event.clientX + (overflowRight ? OFFSET : -OFFSET);
    let clientY;

    Array.prototype.slice.call(this.getClientRects()).some(rect => {
      if (event.clientY >= Math.round(rect.top) &&
          event.clientY <= Math.round(rect.bottom) &&
          event.clientX >= Math.round(rect.left) &&
          event.clientX <= Math.round(rect.right)) {
        clientY = rect.top + (overflowBottom ? 0 : rect.height);

        if (clientPositionOverride && typeof clientPositionOverride === 'function') {
          ({clientX, clientY} = clientPositionOverride(rect, {
            clientX,
            clientY,
            overflowBottom,
            overflowRight,
          }));
        }

        return true;
      }
    });

    return {
      clientX,
      clientY,
      overflowBottom,
      overflowRight,
    };
  }

  displayCardEvent(e) {
    if (isTouchEvent(e)) {
      e.preventDefault();
      return;
    }

    const positions = this.getCardPositions(e);

    this.fetchCard();
    this.displayCard(
      positions.clientX,
      positions.clientY,
      !positions.overflowBottom,
      !positions.overflowRight
    );
  }

  hideCardEvent() {
    this.hideCard();
  }

  handleMobileTouch(e) {
    if (isTouchEvent(e)) {
      this.emitEvent('touchCard');

      if (this.state.display) {
        this.hideCard();
      } else {
        e.preventDefault();

        const positions = this.getCardPositions(e, (rect, {clientY, overflowRight}) => ({
          clientX: overflowRight ? rect.right : rect.left,
          clientY,
        }));

        this.fetchCard();
        this.displayCard(
          positions.clientX,
          positions.clientY,
          !positions.overflowBottom,
          !positions.overflowRight
        );
      }
    }
  }

  onTabFocusIn(e) {
    if (!isTouchEvent(e) && e.code === KEY_CODES.TAB) {
      // doesn't have client positions so can't use this.getCardPositions
      const rect = this.getBoundingClientRect();
      const overflowRight = rect.left + CARD_WIDTH >= window.innerWidth;
      const overflowBottom = rect.bottom + CARD_HEIGHT >= window.innerHeight;
      const clientX = overflowRight ? rect.right : rect.left;
      const clientY = overflowBottom ? rect.top : rect.bottom;

      this.fetchCard();
      this.displayCard(
        clientX,
        clientY,
        !overflowBottom,
        !overflowRight
      );
    }
  }

  render() {
    const containerClasses = classMap({
      'card-link__container': true,
      'card-link__container--open': this.state.display && !!this.displayImages.length,
      'card-link__container--bottom': this.state.bottom,
      'card-link__container--top': !this.state.bottom,
      'card-link__container--left': !this.state.right,
      'card-link__container--wide': this.displayImages.length > 1,
    });

    return html`
      <a href=${this.state.cardInfo.url}
        target='_blank'
        rel='nofollow noreferrer noopener'
        part='link'
        @mouseenter=${this.displayCardEvent}
        @mouseleave=${this.hideCardEvent}
        @click=${this.handleMobileTouch}
        @keyup=${this.onTabFocusIn}
        @focusout=${this.hideCardEvent}>
        <slot></slot>
        <div class=${containerClasses} part='container' style='left: ${this.state.cardX}px; top: ${this.state.cardY}px;'>
          ${this.displayImages.map(image => html`<img part='image' src='${image}' />`)}
          ${this.priceInfo ? html`
            <ul part='price-list'>
              ${this.state.cardInfo.prices().map(price => price.price ? html`
                <li part='price-item'>
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