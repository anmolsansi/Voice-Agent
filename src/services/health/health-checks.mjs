export function runHealthChecks(checks) {
  const results = checks.map((check) => {
    try {
      const result = check.run();
      return { name: check.name, status: result === false ? "failing" : "healthy" };
    } catch (_error) {
      return { name: check.name, status: "failing" };
    }
  });
  const status = results.some((result) => result.status === "failing") ? "degraded" : "healthy";
  return { status, checks: results };
}

export function defaultHealthChecks({ patients = [], schedules = [], config = {} } = {}) {
  return [
    { name: "fixtures", run: () => patients.length > 0 && schedules.length > 0 },
    { name: "voice_provider_config", run: () => Boolean(config.voiceProvider || "sandbox") },
    { name: "webhook_secret_configured", run: () => Boolean(config.webhookSecret || "local") }
  ];
}
