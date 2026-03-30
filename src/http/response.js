function json(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });

  response.end(body);
}

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });

  response.end(body);
}

function notFound(response, payload = { error: 'Not found' }) {
  return json(response, 404, payload);
}

module.exports = {
  json,
  notFound,
  send,
};
