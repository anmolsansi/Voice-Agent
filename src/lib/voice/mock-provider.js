import { VoiceProvider } from './provider.js';

/**
 * MockVoiceProvider — deterministic stub for local dev and unit tests.
 *
 * No microphone or network access is required.  Tests drive transcripts by
 * calling provider.simulateTranscript(text) directly.
 *
 * @example
 * const provider = new MockVoiceProvider({ ttsDelay: 0 });
 * provider.onTranscript((text) => console.log('heard:', text));
 * await provider.startListening();
 * provider.simulateTranscript('My name is Jane');
 * await provider.speak('Hello Jane');
 * provider.destroy();
 */
export class MockVoiceProvider extends VoiceProvider {
  /**
   * @param {object} [options]
   * @param {number} [options.ttsDelay=200]  ms to wait before resolving speak()
   * @param {boolean} [options.verbose=false] log calls to console
   */
  constructor({ ttsDelay = 200, verbose = false } = {}) {
    super();
    this._ttsDelay = ttsDelay;
    this._verbose = verbose;
    this._listening = false;
    this._callbacks = [];
    this.spokenPhrases = [];   // inspectable in tests
  }

  async startListening() {
    this._log('startListening()');
    this._listening = true;
  }

  async stopListening() {
    this._log('stopListening()');
    this._listening = false;
  }

  onTranscript(callback) {
    this._log('onTranscript() registered');
    this._callbacks.push(callback);
  }

  async speak(text) {
    this._log(`speak("${text}")`);
    this.spokenPhrases.push(text);
    if (this._ttsDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this._ttsDelay));
    }
  }

  destroy() {
    this._log('destroy()');
    this._listening = false;
    this._callbacks = [];
  }

  // ── Test helpers ────────────────────────────────────────────────────────────

  /**
   * Push a transcript event to all registered callbacks, as if the user spoke.
   * @param {string} text
   * @param {boolean} [isFinal=true]
   */
  simulateTranscript(text, isFinal = true) {
    if (!this._listening) {
      throw new Error('MockVoiceProvider: simulateTranscript called before startListening()');
    }
    this._callbacks.forEach((cb) => cb(text, { isFinal }));
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _log(msg) {
    if (this._verbose) console.log(`[MockVoiceProvider] ${msg}`);
  }
}
