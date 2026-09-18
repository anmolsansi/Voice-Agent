function createRouter() {
  const routes = [];

  function register(method, path, handler, access = 'staff') {
    routes.push({ method, path, handler, access });
  }

  function all() {
    return routes.slice();
  }

  return {
    get(path, handler, access) {
      register('GET', path, handler, access);
    },
    post(path, handler, access) {
      register('POST', path, handler, access);
    },
    put(path, handler, access) { register('PUT', path, handler, access); },
    patch(path, handler, access) { register('PATCH', path, handler, access); },
    all,
  };
}

module.exports = {
  createRouter,
};
