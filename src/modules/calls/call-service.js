const { getConfig } = require('../../config/env');
const {
  buildCallDetailContract,
  callDetailStore,
  normalizeAuditLog,
  normalizeCall,
  normalizeEvent,
  normalizeRecording,
  normalizeTranscriptTurn,
} = require('./call-store');

async function persistCallDetail(input = {}) {
  const call = normalizeCall(input.call || input);
  const savedCall = await callDetailStore.saveCall(call);

  const events = Array.isArray(input.events) ? input.events : [];
  for (let index = 0; index < events.length; index += 1) {
    await callDetailStore.saveEvent(normalizeEvent(events[index], savedCall.id, index));
  }

  const transcriptTurns = Array.isArray(input.transcriptTurns) ? input.transcriptTurns : [];
  for (let index = 0; index < transcriptTurns.length; index += 1) {
    await callDetailStore.saveTranscriptTurn(normalizeTranscriptTurn(transcriptTurns[index], savedCall.id, index));
  }

  const recordingInputs = normalizeRecordingInputs(input.recordings || input.recording);
  const recordingPolicy = getRecordingPolicy(input.recordingPolicy);
  for (const recording of recordingInputs) {
    await callDetailStore.saveRecording(normalizeRecording(recording, savedCall.id, recordingPolicy));
  }

  const auditLogs = Array.isArray(input.auditLogs) && input.auditLogs.length > 0
    ? input.auditLogs
    : [
        {
          actorType: 'system',
          action: 'call_detail_persisted',
          entityType: 'call',
          entityId: savedCall.id,
          metadata: { source: 'call-service' },
        },
      ];

  for (let index = 0; index < auditLogs.length; index += 1) {
    await callDetailStore.saveAuditLog(normalizeAuditLog(auditLogs[index], savedCall.id, index));
  }

  return getCallDetail(savedCall.publicCallId);
}

async function getCallDetail(publicCallId) {
  const normalizedPublicCallId = typeof publicCallId === 'string' ? publicCallId.trim() : '';
  if (!normalizedPublicCallId) {
    const error = new Error('publicCallId is required.');
    error.code = 'INVALID_PUBLIC_CALL_ID';
    throw error;
  }

  const detail = await callDetailStore.getDetailByPublicCallId(normalizedPublicCallId);
  if (!detail) {
    const error = new Error('Call detail not found.');
    error.code = 'CALL_NOT_FOUND';
    throw error;
  }

  return buildCallDetailContract(detail);
}

function getRecordingPolicy(overrides = {}) {
  const config = getConfig();

  return {
    allowRecordingUrlStorage:
      typeof overrides.allowRecordingUrlStorage === 'boolean'
        ? overrides.allowRecordingUrlStorage
        : config.storeRecordingUrls,
    providerAllowsUrlStorage:
      typeof overrides.providerAllowsUrlStorage === 'boolean'
        ? overrides.providerAllowsUrlStorage
        : config.providerRecordingUrlsEnabled,
  };
}

function normalizeRecordingInputs(recording) {
  if (!recording) {
    return [];
  }

  return Array.isArray(recording) ? recording : [recording];
}

module.exports = {
  getCallDetail,
  persistCallDetail,
};
