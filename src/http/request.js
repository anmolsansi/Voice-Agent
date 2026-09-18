const { fail } = require('./errors');
const MAX_BODY_BYTES = 256 * 1024;
function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    let exceeded = false;
    request.setEncoding('utf8');

    request.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_BODY_BYTES) {
        exceeded = true;
        body = '';
        reject(fail(413, 'BODY_TOO_LARGE', 'Request body exceeds 256 KiB.'));
      }
      if (!exceeded) body += chunk;
    });

    request.on('end', () => {
      if (!exceeded) resolve(body);
    });

    request.on('error', reject);
    request.on('aborted', () => reject(fail(400, 'REQUEST_ABORTED', 'Request aborted.')));
  });
}

async function readJsonBody(request) {
  const rawBody = await readRequestBody(request);

  if (!rawBody.trim()) {
    return {};
  }

  try {
    const value = JSON.parse(rawBody);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch (error) {
    throw fail(400, 'INVALID_JSON', 'Request body must be a JSON object.');
  }
}

module.exports = {
  readJsonBody,
  readRequestBody,
};
