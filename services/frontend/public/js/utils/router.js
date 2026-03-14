/**
 * Client-side router using History API.
 */
class Router {
  constructor() {
    this.routes = [];
    this.notFoundHandler = null;
    window.addEventListener('popstate', () => this._resolve());
  }

  add(path, handler) {
    this.routes.push({ path, handler });
    return this;
  }

  setNotFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  navigate(path) {
    window.history.pushState(null, '', path);
    this._resolve();
  }

  _resolve() {
    const currentPath = window.location.pathname;
    document.body.classList.toggle('route-home', currentPath === '/');

    for (const route of this.routes) {
      const params = this._matchRoute(route.path, currentPath);
      if (params !== null) {
        route.handler(params);
        return;
      }
    }
    if (this.notFoundHandler) this.notFoundHandler();
  }

  _matchRoute(routePath, currentPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const currentParts = currentPath.split('/').filter(Boolean);

    if (routeParts.length !== currentParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = currentParts[i];
      } else if (routeParts[i] !== currentParts[i]) {
        return null;
      }
    }
    return params;
  }

  start() {
    this._resolve();
  }
}

const router = new Router();
export default router;
