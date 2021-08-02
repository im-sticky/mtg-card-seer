import {LitElement, html} from 'lit-element';

export class CardLinker extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.fetchCard();
  }

  fetchCard() {
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${this.textContent}&format=image&version=medium`)
      .then(resp => {
        this.imageUrl = resp.url;
        this.requestUpdate();
      });
  }

  render() {
    return html`
      <a href=${this.imageUrl} target='_blank' rel='nofollow noreferrer noopener'><slot></slot></a>
    `;
  }
}