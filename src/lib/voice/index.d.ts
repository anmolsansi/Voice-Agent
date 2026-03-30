export type VoiceStateValue = 'idle' | 'listening' | 'transcribing' | 'confirming' | 'clarification' | 'manual_required' | 'error';

export type VoiceStateSnapshot = {
  status: VoiceStateValue;
  transcript: string | null;
  confirmationText: string | null;
  clarificationPrompt: string | null;
  fallbackReason: string | null;
  error: string | null;
  activeSection: string | null;
  activeFieldKey: string | null;
  promptText: string | null;
  collectedFields: Record<string, string | number | boolean | null>;
};

export type VoiceUiState = {
  status: VoiceStateValue;
  ui: {
    label: string;
    canUseMicrophone: boolean;
    canUseManualFallback: boolean;
  };
  activeSection: string | null;
  activeFieldKey: string | null;
  promptText: string | null;
};

export type VoicePrompt = {
  fieldKey: string;
  sectionKey: string;
  responseType: string;
  promptText: string;
  clarificationPrompt: string;
};

export type VoiceProvider = {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  onTranscript(callback: (text: string, meta?: { isFinal?: boolean }) => void): void;
  speak(text: string): Promise<void>;
  destroy(): void;
};

export function createInitialVoiceState(options?: { sectionKey?: string | null; fieldKey?: string | null }): VoiceStateSnapshot;
export function transitionVoiceState(currentState: VoiceStateSnapshot, event: Record<string, unknown>): VoiceStateSnapshot;
export function getVoiceUiState(state: VoiceStateSnapshot): VoiceUiState;
export function getVoicePrompt(fieldKey: string | null): VoicePrompt | null;
export function createVoiceProvider(type: 'mock' | 'web-speech', options?: Record<string, unknown>): VoiceProvider;
