class Router {
  constructor() { this.routes = {}; this.current = null; }
  register(name, renderFn) { this.routes[name] = renderFn; }
  navigate(name) {
    if (this.current === name) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    this.current = name;
    if (this.routes[name]) this.routes[name]();
    const page = document.getElementById(name + 'Page');
    if (page) page.classList.add('active');
  }
}
window.router = new Router();
