export function createLogEvent(level, message, metadata = {}) {
  return {
    level,
    message,
    metadata: safeMetadata(metadata),
    at: new Date().toISOString()
  };
}

function safeMetadata(metadata) {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(metadata, (key, value) => {
      if (/secret|token|key|password|transcript/i.test(key)) return "[redacted]";
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[circular]";
        seen.add(value);
      }
      return value;
    })
  );
}
