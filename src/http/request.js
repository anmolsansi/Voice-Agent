function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      resolve(body);
    });

    request.on('error', reject);
  });
}

async function readJsonBody(request) {
  const rawBody = await readRequestBody(request);

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    error.message = 'Request body must be valid JSON.';
    throw error;
  }
}

module.exports = {
  readJsonBody,
  readRequestBody,
};
