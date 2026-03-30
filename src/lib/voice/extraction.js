import { getVoicePrompt, VOICE_RESPONSE_TYPES } from './intake-config.js';

const MONTHS = Object.freeze({
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
});

const WORD_NUMBERS = Object.freeze({
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
});

export function extractFieldValue(fieldKey, transcript) {
  const prompt = getVoicePrompt(fieldKey);
  const normalizedTranscript = normalizeTranscript(transcript);

  if (!prompt || !normalizedTranscript) {
    return buildResult(fieldKey, null, 0, true);
  }

  switch (prompt.responseType) {
    case VOICE_RESPONSE_TYPES.NAME:
    case VOICE_RESPONSE_TYPES.SIGNATURE_NAME:
      return buildResult(fieldKey, extractName(normalizedTranscript), 0.84);
    case VOICE_RESPONSE_TYPES.DATE:
      return buildResult(fieldKey, extractDate(normalizedTranscript), 0.9);
    case VOICE_RESPONSE_TYPES.PHONE:
      return buildResult(fieldKey, extractPhone(normalizedTranscript), 0.95);
    case VOICE_RESPONSE_TYPES.EMAIL:
      return buildResult(fieldKey, extractEmail(normalizedTranscript), 0.85);
    case VOICE_RESPONSE_TYPES.YES_NO:
      return buildResult(fieldKey, extractYesNo(normalizedTranscript), 0.92);
    case VOICE_RESPONSE_TYPES.PAIN_SCORE:
      return buildResult(fieldKey, extractPainScore(normalizedTranscript), 0.9);
    case VOICE_RESPONSE_TYPES.SEX_AT_BIRTH:
      return buildResult(fieldKey, extractSexAtBirth(normalizedTranscript), 0.86);
    case VOICE_RESPONSE_TYPES.FREE_TEXT:
    default:
      return buildResult(fieldKey, normalizedTranscript, normalizedTranscript ? 0.75 : 0);
  }
}

export function extractVoiceHandoff({ sessionId, utteranceId, transcriptText, expectedFieldKey, activeSection = null }) {
  const extraction = expectedFieldKey ? extractFieldValue(expectedFieldKey, transcriptText) : null;

  return {
    sessionId,
    utteranceId,
    transcriptText,
    extractedFields: extraction?.value == null ? [] : [extraction],
    unresolvedRequiredFields: extraction?.value == null && expectedFieldKey ? [expectedFieldKey] : [],
    promptContext: {
      activeSection,
      expectedFieldKey: expectedFieldKey ?? null,
    },
  };
}

function buildResult(fieldKey, value, confidence, defaultNeedsConfirmation = false) {
  return {
    fieldKey,
    value,
    confidence: value == null ? 0 : confidence,
    needsConfirmation: defaultNeedsConfirmation || value == null,
  };
}

function normalizeTranscript(transcript) {
  if (typeof transcript !== 'string') return '';

  return transcript
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^my (first|last) name is\s+/i, '')
    .replace(/^it is\s+/i, '')
    .replace(/^this is\s+/i, '');
}

function extractName(transcript) {
  const cleaned = transcript
    .replace(/^name\s+/i, '')
    .replace(/^i am\s+/i, '')
    .replace(/^i'm\s+/i, '')
    .replace(/[^a-zA-Z'\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(capitalizeWord)
    .join(' ');
}

function extractDate(transcript) {
  const isoLike = transcript.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoLike) {
    const [, year, month, day] = isoLike;
    return toIsoDate(Number(year), Number(month), Number(day));
  }

  const usNumeric = transcript.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (usNumeric) {
    let [, month, day, year] = usNumeric;
    const normalizedYear = Number(year.length === 2 ? `19${year}` : year);
    return toIsoDate(normalizedYear, Number(month), Number(day));
  }

  const monthName = transcript.toLowerCase().match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})\b/);
  if (monthName) {
    const [, monthLabel, day, year] = monthName;
    return toIsoDate(Number(year), MONTHS[monthLabel], Number(day));
  }

  return null;
}

function extractPhone(transcript) {
  const digits = transcript.replace(/\D/g, '');

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;

  return null;
}

function extractEmail(transcript) {
  const compact = transcript.toLowerCase().replace(/\s+/g, '');
  if (compact === 'skip') return null;

  const normalized = compact
    .replace(/\(at\)|\[at\]/g, '@')
    .replace(/\sat\s/g, '@')
    .replace(/\(dot\)|\[dot\]/g, '.')
    .replace(/\sdot\s/g, '.')
    .replace(/underscore/g, '_');

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function extractYesNo(transcript) {
  const normalized = transcript.toLowerCase();
  if (/\b(yes|yeah|yep|correct|affirmative)\b/.test(normalized)) return true;
  if (/\b(no|nope|negative)\b/.test(normalized)) return false;
  return null;
}

function extractPainScore(transcript) {
  const numericMatch = transcript.match(/\b([0-9]|10)\b/);
  if (numericMatch) return Number(numericMatch[1]);

  const normalized = transcript.toLowerCase();
  for (const [label, value] of Object.entries(WORD_NUMBERS)) {
    if (new RegExp(`\\b${label}\\b`).test(normalized)) return value;
  }

  return null;
}

function extractSexAtBirth(transcript) {
  const normalized = transcript.toLowerCase();
  if (normalized.includes('prefer not')) return 'prefer_not_to_say';
  if (normalized.includes('self describe')) return 'self_describe';
  if (normalized.includes('intersex')) return 'intersex';
  if (/\bfemale\b/.test(normalized)) return 'female';
  if (/\bmale\b/.test(normalized)) return 'male';
  return null;
}

function toIsoDate(year, month, day) {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(candidate.getTime())) return null;
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
