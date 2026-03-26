import { VoiceProvider } from './provider.js';

/**
 * WebSpeechProvider — thin adapter over the browser's Web Speech API.
 *
 * Uses SpeechRecognition for STT and SpeechSynthesis for TTS.
 * Browser support: Chrome/Edge (full), Safari 14.1+ (partial), Firefox (none).
 *
 * @example
 * const provider = new WebSpeechProvider({ lang: 'en-US' });
 * provider.onTranscript((text, { isFinal }) => {
 *   if (isFinal) handleAnswer(text);
 * });
 * await provider.startListening();
 * await provider.speak('What is your date of birth?');
 */
export class WebSpeechProvider extends VoiceProvider {
  /**
   * @param {object} [options]
   * @param {string} [options.lang='en-US']         BCP-47 language tag
   * @param {boolean} [options.interimResults=true]  emit partial transcripts
   * @param {number}  [options.maxAlternatives=1]
   */
  constructor({ lang = 'en-US', interimResults = true, maxAlternatives = 1 } = {}) {
    super();

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      throw new Error('WebSpeechProvider: SpeechRecognition is not supported in this browser.');
    }

    this._recognition = new SpeechRecognition();
    this._recognition.lang = lang;
    this._recognition.interimResults = interimResults;
    this._recognition.maxAlternatives = maxAlternatives;
    this._recognition.continuous = true;

    this._callbacks = [];
    this._recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      const text = result[0].transcript.trim();
      const isFinal = result.isFinal;
      this._callbacks.forEach((cb) => cb(text, { isFinal }));
    };
  }

  async startListening() {
    this._recognition.start();
  }

  async stopListening() {
    this._recognition.stop();
  }

  onTranscript(callback) {
    this._callbacks.push(callback);
  }

  async speak(text) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`TTS error: ${e.error}`));
      window.speechSynthesis.speak(utterance);
    });
  }

  destroy() {
    try { this._recognition.abort(); } catch (_) { /* already stopped */ }
    window.speechSynthesis.cancel();
    this._callbacks = [];
  }
}
