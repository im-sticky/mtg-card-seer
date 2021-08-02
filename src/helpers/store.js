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