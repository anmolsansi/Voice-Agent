const { createVoiceEventLogEntries } = require('./event-log-service');
const { buildVoiceEventFailureRecord } = require('./event-log-failure-handler');
const { buildVoiceEventLogBatchInsert } = require('./event-log-repo-adapter');

function orchestrateVoiceEventLog({ event, attemptByField = {} }) {
  const entries = createVoiceEventLogEntries({ event, attemptByField });

  if (!entries.ok) {
    return {
      ok: false,
      failure: buildVoiceEventFailureRecord({
        sessionId: event?.sessionId || null,
        errorCode: entries.error,
      }),
      batch: { statementCount: 0, statements: [] },
    };
  }

  return {
    ok: true,
    failure: null,
    batch: buildVoiceEventLogBatchInsert(entries.auditInserts),
    updates: entries.updates,
    outcomes: entries.outcomes,
  };
}

module.exports = {
  orchestrateVoiceEventLog,
};
