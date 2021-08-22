import {POINTER_TYPE_TOUCH} from 'helpers/constants';

/**
 * Finds the highest possible DOM node relative to a given element stopping at a given parent.
 * @param {HTMLElement} current Element to find highest DOM node of.
 * @param {HTMLElement} componentNode Element to stop at if parent of current.
 * @returns {HTMLElement|Boolean} Highest node in the DOM or true if within given element.
 */
export function findHighestNode(current, componentNode) {
  do {
    if (current === componentNode) {
      return true;
    }

    current = current.parentNode;
  } while (current.parentNode);

  return current;
}

/**
 * Adds an event listener to an element to test if a click event happens outside of it and its children.
 * Unbinds the vent listener when that occurs.
 * @param {HTMLElement} element DOM node to attach event listener to.
 * @param {Function} callback Optional callback to execute after outside click happens.
 * @returns {Function} Function to manually remove the click event listener.
 */
export function onClickOutside(element, callback) {
  const outsideClickListener = event => {
    if (findHighestNode(event.target, element) === document) {
      if (!!callback && typeof callback === 'function') {
        callback();
      }

      removeListener();
    }
  };

  const removeListener = () => document.removeEventListener('click', outsideClickListener);

  document.addEventListener('click', outsideClickListener);

  return removeListener;
}

/**
 * Tests wether or not a JS event originates from a touch based event.
 * @param {Event} event Browser event to check for.
 * @returns {Boolean} True if the event is touch based.
 */
export function isTouchEvent(event) {
  return event.pointerType === POINTER_TYPE_TOUCH ||
    event.sourceCapabilities && event.sourceCapabilities.firesTouchEvents;
}