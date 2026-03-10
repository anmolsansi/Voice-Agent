const TRANSCRIPT_EVENT_TYPES = ['partial_transcript', 'final_transcript'];

function isTranscriptEvent(event) {
  if (!event || typeof event !== 'object') return false;
  if (!TRANSCRIPT_EVENT_TYPES.includes(event.type)) return false;
  if (typeof event.sessionId !== 'string' || event.sessionId.trim() === '') return false;
  if (typeof event.utteranceId !== 'string' || event.utteranceId.trim() === '') return false;
  if (typeof event.text !== 'string') return false;
  if (typeof event.timestamp !== 'number') return false;
  return true;
}

module.exports = {
  TRANSCRIPT_EVENT_TYPES,
  isTranscriptEvent,
};
