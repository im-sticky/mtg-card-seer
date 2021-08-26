import {LitElement, html, css} from 'lit-element';

export class SeerLoader extends LitElement {
  static get styles() {
    return css`
      [part="loader"] {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
      }

      [part="loader-item"] {
        position: absolute;
        top: 33px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #551a8b;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }

      [part="loader-item"]:nth-child(1) {
        left: 8px;
        animation: lds-ellipsis1 0.6s infinite;
      }

      [part="loader-item"]:nth-child(2) {
        left: 8px;
        animation: lds-ellipsis2 0.6s infinite;
      }

      [part="loader-item"]:nth-child(3) {
        left: 32px;
        animation: lds-ellipsis2 0.6s infinite;
      }

      [part="loader-item"]:nth-child(4) {
        left: 56px;
        animation: lds-ellipsis3 0.6s infinite;
      }

      @keyframes lds-ellipsis1 {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes lds-ellipsis3 {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(0);
        }
      }

      @keyframes lds-ellipsis2 {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(24px, 0);
        }
      }
    `;
  }

  render() {
    return html`
      <div part='loader'>
        <div part='loader-item'></div>
        <div part='loader-item'></div>
        <div part='loader-item'></div>
        <div part='loader-item'></div>
      </div>
    `;
  }
}