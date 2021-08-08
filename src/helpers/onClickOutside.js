export function findHighestNode(current, componentNode) {
  if (current === componentNode) {
    return true;
  }
  
  while (current.parentNode) {
    if (current === componentNode) {
      return true;
    }
    
    current = current.parentNode;
  }
  
  return current;
}

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