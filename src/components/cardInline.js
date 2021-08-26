import {html, css} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {Card} from 'helpers/card';
import {CARD_WIDTH} from 'helpers/constants';

/**
 * Component for displaying an inline card image.
 */
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
      @keyframes fadein {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

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
        animation: fadein 83ms ease-out;
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

  /**
   * Initializes component by fetching card data.
   */
  constructor() {
    super();

    this.static = false;
    this.fetchCard();
  }

  /**
   * LitElement lifecycle method for rendering HTML to DOM.
   * @returns {TemplateResult} LitHtml template.
   */
  render() {
    const internalHtml = html`
      ${this.displayFaces.map(face => html`<img part='image' src='${face.image}' alt='${face.name}' />`)}
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
    html`<div class=${classMap({'wide': this.displayFaces.length > 1})} part='container'>
      ${internalHtml}
    </div>` :
    html`<a class=${classMap({'wide': this.displayFaces.length > 1})} part='container' href=${this.state.cardInfo.url} target='_blank' rel='nofollow noreferrer noopener'>
      ${internalHtml}
    </a>`}
    `;
  }
}