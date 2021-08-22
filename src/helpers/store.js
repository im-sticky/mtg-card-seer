import {LitElement} from 'lit-element';
import {MOBILE_WIDTH} from 'helpers/constants';


/**
 * Creates an action type and function pair for use within the StateElement's reducer.
 * @param {String} type Identifier for the action type the reducer will execute.
 * @param {Function} creator Function that will be bound to the action.
 * @returns {Array} Pair of action identifier and action function.
 */
export function createAction(type, creator = (type, value) => ({type, value})) {
  return [type, creator.bind(null, type)];
}

/**
 * Class to intended to be inherited for the purpose of managing state for a LitElement component.
 */
export class StateElement extends LitElement {
  /**
   * Initializes state dispatch method.
   */
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

  /**
   * Getter for Scryfall API URL.
   * @returns {String} Root URL of Scryfall API.
   */
  get apiRoot() {
    return 'https://api.scryfall.com/';
  }

  /**
   * Getter for seeing if browser is mobile width.
   * @returns {Boolean} True if browser window is considered mobile width and below.
   */
  get isMobile() {
    return window.innerWidth < MOBILE_WIDTH;
  }

  /**
   * To be initialized in sub class' constructor.
   * Sets the initial state of the component and creates a reducer method
   * @param {Object} initialState Initial state of the component.
   * @param {Object} handlers Action and handler key value pairs.
   */
  createReducer(initialState, handlers) {
    this.state = initialState;
    this.reducer = (state, action) => {
      state = state || initialState;

      if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
        return handlers[action.type](state, action);
      }

      return state;
    };
  }

  /**
   * Emits a JS event from the DOM component of the specified name.
   * @param {String} eventName Name of event to be emitted.
   * @param {Object} initOptions Event class options.
   */
  emitEvent(eventName, initOptions) {
    this.dispatchEvent(new Event(eventName, Object.assign({
      bubbles: true,
      composed: true,
    }, initOptions)));
  }

  /**
   * LitElement lifecycle method. To be overwritten in sub class or throws error.
   */
  render() {
    throw new Error('NotImplementedError');
  }
}