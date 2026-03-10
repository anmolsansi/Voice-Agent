const { isTranscriptEvent } = require('./contracts');

const keywordFieldMap = [
  { key: 'first_name', patterns: [/first name is\s+([a-z'-]+)/i, /i am\s+([a-z'-]+)\s+[a-z'-]+/i] },
  { key: 'last_name', patterns: [/last name is\s+([a-z'-]+)/i] },
  { key: 'date_of_birth', patterns: [/born on\s+(\d{4}-\d{2}-\d{2})/i, /date of birth\s+(\d{4}-\d{2}-\d{2})/i] },
  { key: 'phone', patterns: [/phone(?: number)? is\s+([\d\-\(\)\s]+)/i] },
  { key: 'insurance_member_id', patterns: [/insurance(?: id| member id) is\s+([a-z0-9-]+)/i] },
  { key: 'chief_complaint', patterns: [/chief complaint is\s+(.+)/i, /i am here for\s+(.+)/i] },
  { key: 'symptom_summary', patterns: [/symptoms? are\s+(.+)/i] },
];

function mapTranscriptEventToFieldUpdates(event) {
  if (!isTranscriptEvent(event)) {
    return { updates: [], error: 'invalid_transcript_event' };
  }

  const updates = [];
  for (const mapping of keywordFieldMap) {
    for (const pattern of mapping.patterns) {
      const m = event.text.match(pattern);
      if (m && m[1]) {
        updates.push({
          fieldKey: mapping.key,
          value: String(m[1]).trim(),
          confidence: event.type === 'final_transcript' ? 0.85 : 0.55,
          source: 'voice',
          utteranceId: event.utteranceId,
        });
        break;
      }
    }
  }

  return { updates, error: null };
}

module.exports = {
  mapTranscriptEventToFieldUpdates,
};
