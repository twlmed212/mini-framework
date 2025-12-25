import { render } from './dom.js';
import { getState, setState, resetHookIndex } from './state.js';

let routes = [];
const container = document.getElementById('app');

// Match current URL to a route
function matchRoute(hash) {
  const clean = hash.replace(/^#\/?/, '');  // "#/active" → "active"
  return routes.find(r => r.path.slice(1) === clean) || routes.find(r => r.path === '*');
}

// Render the current route
function renderRoute() {
  const hash = window.location.hash || '#/';
  const route = matchRoute(hash);
  
  if (!route) return;

  // Sync state with URL (for filters)
  if (route.path !== '*') {
    const newFilter = route.path.slice(1) || 'all';
    setState({ filter: newFilter });
  }

  // Render the view
  resetHookIndex();
  const vnode = route.view();
  render(vnode, container);
}

// Public API
export function defineRoutes(routeArray) {
  routes = routeArray;
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();  // Initial render
}