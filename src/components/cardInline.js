import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {Card} from 'helpers/card';
import {CARD_WIDTH} from 'helpers/constants';

export class CardInline extends Card {
  static get properties() {
    return {
      static: {
        type: Boolean,
      },
    };
  }

  static get styles() {
    return css`
      [part='container'] {
        display: inline-flex;
        flex-wrap: wrap;
        width: ${CARD_WIDTH}px;
        max-width: 100%;
      }

      [part='container'].wide {
        width: ${CARD_WIDTH * 2}px;
      }

      [part="image"] {
        display: block;
        max-width: 100%;
        height: 100%;
      }

      [part='container'].wide [part="image"] {
        width: 50%;
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
    `;
  }

  constructor() {
    super();

    this.static = false;
    this.fetchCard();
  }

  render() {
    const internalHtml = html`
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
    `;

    return html`
      ${this.static ?
    html`<div class=${classMap({'wide': this.displayImages.length > 1})} part='container'>
      ${internalHtml}
    </div>` :
    html`<a class=${classMap({'wide': this.displayImages.length > 1})} part='container' href=${this.state.cardInfo.url} target='_blank' rel='nofollow noreferrer noopener'>
      ${internalHtml}
    </a>`}
    `;
  }
}