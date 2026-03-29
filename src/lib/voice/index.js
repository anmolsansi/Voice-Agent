/**
 * Voice provider abstraction for CheckIn Care.
 *
 * Import the VoiceProvider base class to type-hint your code against the
 * stable interface.  Choose a concrete provider based on environment:
 *
 *   - MockVoiceProvider    → local dev, unit tests, CI (no real APIs needed)
 *   - WebSpeechProvider    → browser-native STT/TTS via Web Speech API
 *   - (future) DeepgramProvider, AssemblyAIProvider, etc.
 *
 * All providers share the same interface so product code never needs to know
 * which vendor is active.
 */
export { VoiceProvider } from './provider.js';
export { MockVoiceProvider } from './mock-provider.js';
export { WebSpeechProvider } from './web-speech-provider.js';
export {
  VOICE_STATES,
  VOICE_STATE_TRANSITIONS,
  VOICE_STATE_UI,
  createInitialVoiceState,
  isValidVoiceTransition,
  transitionVoiceState,
  getVoiceUiState,
} from './state-machine.js';

import { MockVoiceProvider } from './mock-provider.js';
import { WebSpeechProvider } from './web-speech-provider.js';

/**
 * Factory: returns the right provider for the current environment.
 *
 * @param {'mock' | 'web-speech'} type
 * @param {object} [options]  passed through to the provider constructor
 * @returns {import('./provider.js').VoiceProvider}
 */
export function createVoiceProvider(type, options = {}) {
  switch (type) {
    case 'mock':
      return new MockVoiceProvider(options);
    case 'web-speech':
      return new WebSpeechProvider(options);
    default:
      throw new Error(`Unknown voice provider type: "${type}"`);
  }
}
