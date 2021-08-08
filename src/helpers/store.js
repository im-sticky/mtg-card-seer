import {LitElement} from 'lit-element';
import {MOBILE_WIDTH} from 'helpers/constants';


export function createReducer(initialState, handlers) {
  return (state, action) => {
    state = state || initialState;

    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action);
    }

    return state;
  };
}

export function createAction(type, creator = (type, value) => ({type, value})) {
  return [type, creator.bind(null, type)];
}

export class StateElement extends LitElement {
  constructor() {
    super();

    this.dispatch = (action, callback) => {
      this.state = this.reducer(this.state, action);
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

  get apiRoot() {
    return 'https://api.scryfall.com/';
  }

  get isMobile() {
    return window.innerWidth < MOBILE_WIDTH;
  }
}