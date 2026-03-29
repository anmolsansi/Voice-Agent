'use client';

import { useEffect, useMemo, useState } from 'react';

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

const LAST_SESSION_STORAGE_KEY = 'voice-agent:last-intake-session';

type PatientIntakeSessionProps = {
  publicSessionId: string;
  reviewHref: string;
  startHref: string;
};

type SaveState = Record<string, 'idle' | 'saving' | 'saved' | 'error'>;

export function PatientIntakeSession({ publicSessionId, reviewHref, startHref }: PatientIntakeSessionProps) {
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>({});
  const [saveError, setSaveError] = useState('');

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

  const completionSummary = useMemo(() => {
    if (!session) {
      return 'Loading intake session…';
    }

    const remaining = session.completionSummary.incompleteRequiredFields;
    return remaining === 0 ? 'Required fields complete' : `${remaining} required field${remaining === 1 ? '' : 's'} still needed`;
  }, [session]);

  async function persistField(fieldKey: string, value: string | boolean) {
    if (!session) return;

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
            lastUpdatedBySource: 'manual',
          },
        },
      };
    });
    setSaveState((current) => ({ ...current, [fieldKey]: 'saving' }));

    try {
      const result = await saveIntakeField({
        sessionId: session.id,
        fieldKey,
        value,
      });

      const refreshedSession = await resumeIntakeSession(session.publicSessionId);
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
    }
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
