function createRouter() {
  const routes = [];

  function register(method, path, handler) {
    routes.push({ method, path, handler });
  }

  function all() {
    return routes.slice();
  }

  return {
    get(path, handler) {
      register('GET', path, handler);
    },
    post(path, handler) {
      register('POST', path, handler);
    },
    all,
  };
}

module.exports = {
  createRouter,
};
