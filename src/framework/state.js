
let state      = {};
const listeners = new Set();
let callIndex   = 0;   

export function initState(initialState) {
  state = { ...initialState };
}

export function getState() {
  return { ...state };           
}

export function setState(newState) {
  state = { ...state, ...newState };

  if (!Array.isArray(state.hooks)) state.hooks = [];

  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useState(initialValue) {
  const idx = callIndex;

  if (state.hooks[idx] === undefined) {
    state.hooks[idx] = initialValue;
  }

  const setValue = (v) => {
    state.hooks[idx] = v;
    listeners.forEach((fn) => fn(state));
  };
  callIndex++;
  return [state.hooks[idx], setValue];
}

export function resetHookIndex() {
  callIndex = 0;
}