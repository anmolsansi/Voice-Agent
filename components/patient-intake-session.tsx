'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ConsentSection } from '@/components/consent-section';
import { DemographicsSection } from '@/components/demographics-section';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';
import { VisitReasonSection } from '@/components/visit-reason-section';
import {
  getFieldBooleanValue,
  getFieldStringValue,
  getSection,
  resumeIntakeSession,
  saveIntakeField,
  type IntakeSession,
} from '@/lib/intake-session';
import {
  createInitialVoiceState,
  createVoiceProvider,
  getVoicePrompt,
  getVoiceUiState,
  transitionVoiceState,
} from '@/src/lib/voice/index.js';

const LAST_SESSION_STORAGE_KEY = 'voice-agent:last-intake-session';
const SUPPORTED_VOICE_FIELD_KEYS = [
  'patient.firstName',
  'patient.lastName',
  'patient.dateOfBirth',
  'patient.sexAtBirth',
  'patient.phone',
  'patient.email',
  'visit.chiefComplaint',
  'visit.symptomDuration',
  'visit.feverPresent',
  'visit.injuryRelated',
  'consent.treatmentConsent',
  'consent.hipaaAcknowledgment',
  'consent.signatureName',
] as const;
const SEX_AT_BIRTH_OPTIONS = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Intersex', value: 'intersex' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  { label: 'Self describe', value: 'self_describe' },
];

type PatientIntakeSessionProps = {
  publicSessionId: string;
  reviewHref: string;
  startHref: string;
};

type SaveState = Record<string, 'idle' | 'saving' | 'saved' | 'error'>;
type VoiceMode = 'manual' | 'voice';
type SupportedVoiceFieldKey = (typeof SUPPORTED_VOICE_FIELD_KEYS)[number];
type VoiceStatus = ReturnType<typeof getVoiceUiState>;
type PendingExtraction = {
  fieldKey: SupportedVoiceFieldKey;
  transcript: string;
  value: string | boolean;
  confirmationText: string;
};

type SpeechProvider = ReturnType<typeof createVoiceProvider>;

export function PatientIntakeSession({ publicSessionId, reviewHref, startHref }: PatientIntakeSessionProps) {
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>({});
  const [saveError, setSaveError] = useState('');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('manual');
  const [voiceState, setVoiceState] = useState(() => createInitialVoiceState());
  const [voiceError, setVoiceError] = useState('');
  const [pendingExtraction, setPendingExtraction] = useState<PendingExtraction | null>(null);

  const providerRef = useRef<SpeechProvider | null>(null);
  const sessionRef = useRef<IntakeSession | null>(null);
  const voiceStateRef = useRef(voiceState);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadingState('loading');
        const nextSession = await resumeIntakeSession(publicSessionId);

        if (cancelled) return;

        window.localStorage.setItem(LAST_SESSION_STORAGE_KEY, nextSession.publicSessionId);
        setSession(nextSession);
        setLoadError('');
        setLoadingState('ready');
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load intake session.');
        setLoadingState('error');
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [publicSessionId]);

  const activeVoiceField = useMemo(() => getNextIncompleteVoiceField(session), [session]);

  useEffect(() => {
    const nextFieldKey = pendingExtraction?.fieldKey ?? activeVoiceField;
    const resetState = createInitialVoiceState({ fieldKey: nextFieldKey ?? undefined });
    setVoiceState((current) => ({
      ...current,
      activeFieldKey: resetState.activeFieldKey,
      activeSection: resetState.activeSection,
      promptText: resetState.promptText,
      clarificationPrompt: resetState.clarificationPrompt,
    }));
  }, [activeVoiceField, pendingExtraction?.fieldKey]);

  useEffect(() => {
    if (voiceMode !== 'voice') {
      providerRef.current?.destroy();
      providerRef.current = null;
      setVoiceState((current) => transitionVoiceState(current, { type: 'STOP' }));
      return;
    }

    if (providerRef.current) return;

    try {
      const provider = createVoiceProvider('web-speech');
      provider.onTranscript((text: string, meta: { isFinal?: boolean } = {}) => {
        if (!meta.isFinal) return;

        const currentState = voiceStateRef.current;
        const fieldKey = currentState.activeFieldKey as SupportedVoiceFieldKey | null;
        if (!fieldKey) return;

        const transcribingState = transitionVoiceState(currentState, {
          type: 'TRANSCRIPT_RECEIVED',
          transcript: text,
        });
        const completedState = transitionVoiceState(transcribingState, {
          type: 'TRANSCRIPTION_COMPLETED',
          transcript: text,
        });

        setVoiceState(completedState);

        const extractedValue = completedState.collectedFields[fieldKey];
        if (completedState.status === 'confirming' && extractedValue != null) {
          setPendingExtraction({
            fieldKey,
            transcript: text,
            value: extractedValue as string | boolean,
            confirmationText:
              completedState.confirmationText ?? `I heard ${String(extractedValue)}. Please confirm before continuing.`,
          });
          setVoiceError('');
          return;
        }

        setPendingExtraction(null);
        setVoiceError(completedState.clarificationPrompt ?? 'I could not understand that answer. Please try again or type it below.');
      });
      providerRef.current = provider;
      setVoiceError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Voice is not available in this browser.';
      setVoiceError(message);
      setVoiceState((current) => transitionVoiceState(current, { type: 'ERROR_OCCURRED', error: message }));
    }

    return () => {
      providerRef.current?.destroy();
      providerRef.current = null;
    };
  }, [voiceMode]);

  const completionSummary = useMemo(() => {
    if (!session) {
      return 'Loading intake session…';
    }

    const remaining = session.completionSummary.incompleteRequiredFields;
    return remaining === 0 ? 'Required fields complete' : `${remaining} required field${remaining === 1 ? '' : 's'} still needed`;
  }, [session]);

  const voiceUi = useMemo<VoiceStatus>(() => getVoiceUiState(voiceState), [voiceState]);
  const activePrompt = voiceUi.activeFieldKey ? getVoicePrompt(voiceUi.activeFieldKey) : null;

  async function persistField(fieldKey: string, value: string | boolean, source: 'manual' | 'voice' = 'manual') {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    setSaveError('');
    setSession((current) => {
      if (!current) return current;

      return {
        ...current,
        fields: {
          ...current.fields,
          [fieldKey]: {
            ...current.fields[fieldKey],
            fieldKey,
            value,
            displayValue: String(value),
            completionState: current.fields[fieldKey]?.completionState || 'in_progress',
            lastUpdatedAt: new Date().toISOString(),
            lastUpdatedBySource: source,
          },
        },
      };
    });
    setSaveState((current) => ({ ...current, [fieldKey]: 'saving' }));

    try {
      const result = await saveIntakeField({
        sessionId: currentSession.id,
        fieldKey,
        value,
        source,
      });

      const refreshedSession = await resumeIntakeSession(currentSession.publicSessionId);
      setSession(refreshedSession);
      setSaveState((current) => ({ ...current, [fieldKey]: 'saved' }));

      window.setTimeout(() => {
        setSaveState((current) => (current[fieldKey] === 'saved' ? { ...current, [fieldKey]: 'idle' } : current));
      }, 1200);

      if (result.field.fieldKey === 'consent.signatureName') {
        setSaveState((current) => ({ ...current, 'consent.signedAt': 'saved' }));
      }
    } catch (error) {
      setSaveState((current) => ({ ...current, [fieldKey]: 'error' }));
      setSaveError(error instanceof Error ? error.message : 'Unable to save intake field.');
      throw error;
    }
  }

  async function handleStartListening() {
    if (!providerRef.current) {
      setVoiceError('Voice is not available in this browser.');
      return;
    }

    if (!voiceUi.activeFieldKey) {
      setVoiceError('All supported voice fields have already been completed.');
      return;
    }

    setPendingExtraction(null);
    setVoiceError('');
    const nextState = transitionVoiceState(voiceStateRef.current, { type: 'START_LISTENING' });
    setVoiceState(nextState);

    try {
      await providerRef.current.startListening();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start microphone listening.';
      setVoiceError(message);
      setVoiceState((current) => transitionVoiceState(current, { type: 'ERROR_OCCURRED', error: message }));
    }
  }

  async function handleApplyVoiceAnswer() {
    if (!pendingExtraction) return;

    await persistField(pendingExtraction.fieldKey, pendingExtraction.value, 'voice');
    setVoiceState((current) => transitionVoiceState(current, { type: 'CONFIRMATION_ACCEPTED' }));
    setPendingExtraction(null);
    setVoiceError('');
  }

  async function handleRetryVoiceAnswer() {
    try {
      await providerRef.current?.stopListening();
    } catch {
      // no-op
    }

    setPendingExtraction(null);
    setVoiceState((current) => transitionVoiceState(current, { type: 'CONFIRMATION_REJECTED' }));
    setVoiceError('Recording cleared. You can listen again or update the field manually below.');
  }

  if (loadingState === 'loading') {
    return <StateCard title="Loading session" description="Fetching the saved intake state for this patient session." />;
  }

  if (loadingState === 'error' || !session) {
    return (
      <div className="space-y-6">
        <StateCard title="Unable to load session" description={loadError || 'This intake session could not be loaded.'} tone="warning" />
        <SessionActions primaryLabel="Back to start" primaryHref={startHref} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StateCard
        title="Live session connected"
        description="This route now loads the real intake session, persists manual edits through the session field API, and restores saved values when the page reloads."
        tone={session.completionSummary.incompleteRequiredFields === 0 ? 'success' : 'default'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Public ID: {session.publicSessionId}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionSummary}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Updated {new Date(session.updatedAt).toLocaleTimeString()}</span>
        </div>
      </StateCard>

      <StateCard
        title="Intake mode"
        description="Switch between the existing manual form and the new voice helper at any time. Manual editing always stays available below."
        tone={voiceMode === 'voice' ? 'success' : 'default'}
      >
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
            {(['manual', 'voice'] as const).map((mode) => {
              const active = voiceMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setVoiceMode(mode)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold capitalize transition',
                    active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  {mode} mode
                </button>
              );
            })}
          </div>

          {voiceMode === 'voice' ? (
            <div className="space-y-4 rounded-3xl border border-blue-200 bg-blue-50/70 p-5">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                <span className="rounded-full bg-white/80 px-3 py-1">Status: {voiceUi.ui.label}</span>
                {voiceUi.activeSection ? <span className="rounded-full bg-white/80 px-3 py-1">Section: {voiceUi.activeSection}</span> : null}
                {voiceUi.activeFieldKey ? <span className="rounded-full bg-white/80 px-3 py-1">Field: {voiceUi.activeFieldKey}</span> : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Current prompt</p>
                <p className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                  {activePrompt?.promptText ?? 'Voice intake is complete for the currently supported fields.'}
                </p>
                {activePrompt?.clarificationPrompt ? (
                  <p className="text-xs text-slate-500">If needed, we will ask again: {activePrompt.clarificationPrompt}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleStartListening}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!voiceUi.activeFieldKey}
                >
                  Start listening
                </button>
                <button
                  type="button"
                  onClick={handleRetryVoiceAnswer}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                >
                  Re-record
                </button>
              </div>

              {voiceState.transcript ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Latest transcript</p>
                  <p className="mt-1 leading-6">{voiceState.transcript}</p>
                </div>
              ) : null}

              {pendingExtraction ? (
                <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Confirm extracted answer</p>
                    <p className="mt-1 text-sm text-emerald-800">{pendingExtraction.confirmationText}</p>
                  </div>

                  <VoiceValueEditor
                    fieldKey={pendingExtraction.fieldKey}
                    value={pendingExtraction.value}
                    onChange={(value) => setPendingExtraction((current) => (current ? { ...current, value } : current))}
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleApplyVoiceAnswer()}
                      className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Confirm and continue
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRetryVoiceAnswer()}
                      className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-400"
                    >
                      Re-record
                    </button>
                    <p className="self-center text-xs text-emerald-900/80">You can also edit the form manually below before continuing.</p>
                  </div>
                </div>
              ) : null}

              {voiceError ? <p className="text-sm text-rose-600">{voiceError}</p> : null}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Manual mode is active. The full intake form works exactly as before, and you can switch back to voice mode whenever you want.</p>
          )}
        </div>
      </StateCard>

      {saveError ? <p className="text-sm text-rose-600">{saveError}</p> : null}

      <DemographicsSection
        values={{
          firstName: getFieldStringValue(session, 'patient.firstName'),
          lastName: getFieldStringValue(session, 'patient.lastName'),
          dateOfBirth: getFieldStringValue(session, 'patient.dateOfBirth'),
          sexAtBirth: getFieldStringValue(session, 'patient.sexAtBirth'),
          sexAtBirthSelfDescribe: getFieldStringValue(session, 'patient.sexAtBirthSelfDescribe'),
          genderIdentity: getFieldStringValue(session, 'patient.genderIdentity'),
          phone: getFieldStringValue(session, 'patient.phone'),
          email: getFieldStringValue(session, 'patient.email'),
          addressLine1: getFieldStringValue(session, 'patient.addressLine1'),
          addressLine2: getFieldStringValue(session, 'patient.addressLine2'),
          city: getFieldStringValue(session, 'patient.city'),
          state: getFieldStringValue(session, 'patient.state'),
          postalCode: getFieldStringValue(session, 'patient.postalCode'),
          preferredLanguage: getFieldStringValue(session, 'patient.preferredLanguage'),
        }}
        sectionState={getSection(session, 'demographics')}
        saveState={saveState}
        onFieldChange={persistField}
      />

      <VisitReasonSection
        values={{
          chiefComplaint: getFieldStringValue(session, 'visit.chiefComplaint'),
          symptomDuration: getFieldStringValue(session, 'visit.symptomDuration'),
          feverPresent: getFieldBooleanValue(session, 'visit.feverPresent'),
          injuryRelated: getFieldBooleanValue(session, 'visit.injuryRelated'),
        }}
        sectionState={getSection(session, 'visit_reason')}
        saveState={saveState}
        onFieldChange={persistField}
      />

      <ConsentSection
        values={{
          treatmentConsent: getFieldBooleanValue(session, 'consent.treatmentConsent'),
          hipaaAcknowledgment: getFieldBooleanValue(session, 'consent.hipaaAcknowledgment'),
          financialResponsibility: getFieldBooleanValue(session, 'consent.financialResponsibility'),
          signatureName: getFieldStringValue(session, 'consent.signatureName'),
          signedAt: getFieldStringValue(session, 'consent.signedAt'),
        }}
        sectionState={getSection(session, 'consent')}
        saveState={saveState}
        onFieldChange={persistField}
      />

      <SessionActions
        primaryLabel="Continue to review"
        primaryHref={reviewHref}
        secondaryLabel="Back to start"
        secondaryHref={startHref}
      />
    </div>
  );
}

function getNextIncompleteVoiceField(session: IntakeSession | null): SupportedVoiceFieldKey | null {
  if (!session) return SUPPORTED_VOICE_FIELD_KEYS[0];

  return (
    SUPPORTED_VOICE_FIELD_KEYS.find((fieldKey) => {
      const value = session.fields[fieldKey]?.value;
      if (typeof value === 'boolean') return false;
      return String(value ?? '').trim().length === 0;
    }) ?? null
  );
}

function VoiceValueEditor({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: SupportedVoiceFieldKey;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <label className="block space-y-2 text-sm font-medium text-slate-900">
        <span>Adjust answer if needed</span>
        <select
          value={value ? 'yes' : 'no'}
          onChange={(event) => onChange(event.target.value === 'yes')}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
    );
  }

  if (fieldKey === 'patient.sexAtBirth') {
    return (
      <label className="block space-y-2 text-sm font-medium text-slate-900">
        <span>Adjust answer if needed</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        >
          {SEX_AT_BIRTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block space-y-2 text-sm font-medium text-slate-900">
      <span>Adjust answer if needed</span>
      {fieldKey === 'visit.chiefComplaint' ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />
      )}
    </label>
  );
}
