const http = require('http');
const { getConfig } = require('./config/env');
const { createApp } = require('./app');

function startServer() {
  const config = getConfig();
  const app = createApp(config);
  const server = http.createServer(app);

  server.listen(config.port, () => {
    console.log(`${config.appName} listening on port ${config.port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
};
