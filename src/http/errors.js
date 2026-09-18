function fail(status, code, message) {
  return Object.assign(new Error(message), { status, code });
}
function objectInput(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some((key) => !allowed.includes(key))) {
    throw fail(400, 'VALIDATION_ERROR', 'Unsupported request fields.');
  }
  return value;
}
function uuid(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw fail(400, 'VALIDATION_ERROR', 'A valid UUID is required.');
  }
  return value;
}
module.exports = { fail, objectInput, uuid };
