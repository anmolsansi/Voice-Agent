/**
 * VoiceProvider — abstract interface for STT/TTS adapters.
 *
 * All voice providers must extend this class and implement every method.
 * Product code should depend only on this interface, never on a concrete
 * provider, so that vendors can be swapped without changing intake logic.
 *
 * Lifecycle:
 *   new Provider(options) → startListening() / speak() → ... → destroy()
 */
export class VoiceProvider {
  /**
   * Begin capturing audio and emitting transcript events.
   * Must be called before onTranscript callbacks fire.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async startListening() {
    throw new Error(`${this.constructor.name} must implement startListening()`);
  }

  /**
   * Stop capturing audio.  Any in-flight recognition is discarded.
   * @returns {Promise<void>}
   */
  async stopListening() {
    throw new Error(`${this.constructor.name} must implement stopListening()`);
  }

  /**
   * Register a callback that fires whenever a transcript segment arrives.
   * The callback receives a single string — the recognised text.
   * May be called with partial (interim) results depending on the provider.
   *
   * @param {(text: string, opts?: { isFinal: boolean }) => void} callback
   */
  // eslint-disable-next-line no-unused-vars
  onTranscript(callback) {
    throw new Error(`${this.constructor.name} must implement onTranscript(callback)`);
  }

  /**
   * Speak the given text via TTS.
   * Returns a promise that resolves when speech has finished (or is queued,
   * for providers that queue internally).
   *
   * @param {string} text
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async speak(text) {
    throw new Error(`${this.constructor.name} must implement speak(text)`);
  }

  /**
   * Tear down all resources: close audio streams, cancel pending speech,
   * remove event listeners.  The instance must not be used after this call.
   */
  destroy() {
    throw new Error(`${this.constructor.name} must implement destroy()`);
  }
}
