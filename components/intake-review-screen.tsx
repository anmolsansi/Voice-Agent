'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';
import { resumeIntakeSession, submitIntakeSession, type IntakeSession, type IntakeValidationSummary } from '@/lib/intake-session';

type IntakeReviewScreenProps = {
  publicSessionId: string;
  sessionHref: string;
  completeHref: string;
  startHref: string;
};

type ReviewFieldDefinition = {
  key: string;
  label: string;
  required?: boolean;
  sectionKey: 'demographics' | 'visit_reason' | 'consent';
  sectionLabel: string;
  anchor: string;
  getDisplayValue: (session: IntakeSession) => string;
  isMissing: (session: IntakeSession) => boolean;
  isInvalid?: (session: IntakeSession) => boolean;
  invalidReason?: string;
};

type ReviewIssue = {
  key: string;
  label: string;
  sectionKey: string;
  sectionLabel: string;
  anchor: string;
  type: 'missing' | 'invalid';
  detail: string;
};

const REVIEW_FIELDS: ReviewFieldDefinition[] = [
  {
    key: 'patient.firstName',
    label: 'First name',
    required: true,
    sectionKey: 'demographics',
    sectionLabel: 'Demographics',
    anchor: 'section-demographics',
    getDisplayValue: (session) => getStringValue(session, 'patient.firstName'),
    isMissing: (session) => !getStringValue(session, 'patient.firstName'),
  },
  {
    key: 'patient.lastName',
    label: 'Last name',
    required: true,
    sectionKey: 'demographics',
    sectionLabel: 'Demographics',
    anchor: 'section-demographics',
    getDisplayValue: (session) => getStringValue(session, 'patient.lastName'),
    isMissing: (session) => !getStringValue(session, 'patient.lastName'),
  },
  {
    key: 'patient.dateOfBirth',
    label: 'Date of birth',
    required: true,
    sectionKey: 'demographics',
    sectionLabel: 'Demographics',
    anchor: 'section-demographics',
    getDisplayValue: (session) => formatDateValue(getStringValue(session, 'patient.dateOfBirth')),
    isMissing: (session) => !getStringValue(session, 'patient.dateOfBirth'),
    isInvalid: (session) => {
      const value = getStringValue(session, 'patient.dateOfBirth');
      if (!value) return false;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) || date.getTime() >= Date.now();
    },
    invalidReason: 'Date of birth must be a valid past date.',
  },
  {
    key: 'patient.sexAtBirth',
    label: 'Sex at birth',
    required: true,
    sectionKey: 'demographics',
    sectionLabel: 'Demographics',
    anchor: 'section-demographics',
    getDisplayValue: (session) => humanizeEnum(getStringValue(session, 'patient.sexAtBirth')),
    isMissing: (session) => !getStringValue(session, 'patient.sexAtBirth'),
  },
  {
    key: 'patient.phone',
    label: 'Phone number',
    required: true,
    sectionKey: 'demographics',
    sectionLabel: 'Demographics',
    anchor: 'section-demographics',
    getDisplayValue: (session) => formatPhoneValue(getStringValue(session, 'patient.phone')),
    isMissing: (session) => !getStringValue(session, 'patient.phone'),
    isInvalid: (session) => {
      const value = getStringValue(session, 'patient.phone');
      return Boolean(value) && !/^\+1\d{10}$/.test(value);
    },
    invalidReason: 'Phone number must include a valid US number.',
  },
  {
    key: 'visit.chiefComplaint',
    label: 'Chief complaint',
    required: true,
    sectionKey: 'visit_reason',
    sectionLabel: 'Visit reason',
    anchor: 'section-visit-reason',
    getDisplayValue: (session) => getStringValue(session, 'visit.chiefComplaint'),
    isMissing: (session) => !getStringValue(session, 'visit.chiefComplaint'),
    isInvalid: (session) => getStringValue(session, 'visit.chiefComplaint').length > 500,
    invalidReason: 'Chief complaint must be 500 characters or less.',
  },
  {
    key: 'consent.treatmentConsent',
    label: 'Treatment consent',
    required: true,
    sectionKey: 'consent',
    sectionLabel: 'Consent',
    anchor: 'section-consent',
    getDisplayValue: (session) => formatBooleanValue(session.fields['consent.treatmentConsent']?.value === true),
    isMissing: (session) => session.fields['consent.treatmentConsent']?.value !== true,
  },
  {
    key: 'consent.hipaaAcknowledgment',
    label: 'HIPAA acknowledgment',
    required: true,
    sectionKey: 'consent',
    sectionLabel: 'Consent',
    anchor: 'section-consent',
    getDisplayValue: (session) => formatBooleanValue(session.fields['consent.hipaaAcknowledgment']?.value === true),
    isMissing: (session) => session.fields['consent.hipaaAcknowledgment']?.value !== true,
  },
  {
    key: 'consent.signatureName',
    label: 'Signature (full name)',
    required: true,
    sectionKey: 'consent',
    sectionLabel: 'Consent',
    anchor: 'section-consent',
    getDisplayValue: (session) => getStringValue(session, 'consent.signatureName'),
    isMissing: (session) => !getStringValue(session, 'consent.signatureName'),
  },
  {
    key: 'consent.signedAt',
    label: 'Signature timestamp',
    required: true,
    sectionKey: 'consent',
    sectionLabel: 'Consent',
    anchor: 'section-consent',
    getDisplayValue: (session) => formatDateTimeValue(getStringValue(session, 'consent.signedAt')),
    isMissing: (session) => !getStringValue(session, 'consent.signedAt'),
  },
];

function getStringValue(session: IntakeSession, fieldKey: string) {
  const value = session.fields[fieldKey]?.value;
  return typeof value === 'string' ? value : '';
}

function humanizeEnum(value: string) {
  return value ? value.replace(/_/g, ' ') : 'Not provided';
}

function formatPhoneValue(value: string) {
  if (!value) return 'Not provided';
  const match = value.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
}

function formatBooleanValue(value: boolean) {
  return value ? 'Yes' : 'Not accepted yet';
}

function formatDateValue(value: string) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDateTimeValue(value: string) {
  if (!value) return 'Not signed yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getSectionHref(sessionHref: string, anchor: string) {
  return `${sessionHref}#${anchor}`;
}

function buildIssues(session: IntakeSession) {
  const issues: ReviewIssue[] = [];

  for (const field of REVIEW_FIELDS) {
    if (field.isMissing(session)) {
      issues.push({
        key: field.key,
        label: field.label,
        sectionKey: field.sectionKey,
        sectionLabel: field.sectionLabel,
        anchor: field.anchor,
        type: 'missing',
        detail: `${field.label} is still required before submission.`,
      });
      continue;
    }

    if (field.isInvalid?.(session)) {
      issues.push({
        key: field.key,
        label: field.label,
        sectionKey: field.sectionKey,
        sectionLabel: field.sectionLabel,
        anchor: field.anchor,
        type: 'invalid',
        detail: field.invalidReason || `${field.label} needs attention.`,
      });
    }
  }

  return issues;
}

function buildIssuesFromValidation(validation: IntakeValidationSummary | undefined, fallbackIssues: ReviewIssue[]) {
  if (!validation) return fallbackIssues;

  const seen = new Set<string>();
  const validationIssues: ReviewIssue[] = [];

  for (const fieldKey of [...validation.incompleteRequiredFields, ...validation.invalidFields]) {
    if (seen.has(fieldKey)) continue;
    seen.add(fieldKey);

    const definition = REVIEW_FIELDS.find((field) => field.key === fieldKey);
    const fieldResult = validation.fieldResults.find((result) => result.fieldKey === fieldKey);

    validationIssues.push({
      key: fieldKey,
      label: definition?.label || fieldKey,
      sectionKey: definition?.sectionKey || 'unknown',
      sectionLabel: definition?.sectionLabel || 'Needs attention',
      anchor: definition?.anchor || 'section-demographics',
      type: validation.invalidFields.includes(fieldKey) ? 'invalid' : 'missing',
      detail:
        fieldResult?.message ||
        (validation.invalidFields.includes(fieldKey)
          ? `${definition?.label || fieldKey} needs attention before submission.`
          : `${definition?.label || fieldKey} is still required before submission.`),
    });
  }

  return validationIssues.length > 0 ? validationIssues : fallbackIssues;
}

export function IntakeReviewScreen({ publicSessionId, sessionHref, completeHref, startHref }: IntakeReviewScreenProps) {
  const router = useRouter();
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [submitValidation, setSubmitValidation] = useState<IntakeValidationSummary | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadingState('loading');
        const nextSession = await resumeIntakeSession(publicSessionId);

        if (cancelled) return;

        setSession(nextSession);
        setLoadError('');
        setLoadingState('ready');
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load intake review.');
        setLoadingState('error');
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [publicSessionId]);

  const reviewState = useMemo(() => {
    if (!session) {
      return {
        issues: [] as ReviewIssue[],
        readyToSubmit: false,
      };
    }

    const issues = buildIssues(session);

    return {
      issues,
      readyToSubmit: issues.length === 0 && session.completionSummary.incompleteRequiredFields === 0,
    };
  }, [session]);

  const displayedIssues = useMemo(
    () => buildIssuesFromValidation(submitValidation, reviewState.issues),
    [reviewState.issues, submitValidation],
  );

  async function handleSubmit() {
    if (!session || submitState === 'submitting') return;

    try {
      setSubmitState('submitting');
      setSubmitError('');
      setSubmitValidation(undefined);

      const signatureName = getStringValue(session, 'consent.signatureName');
      const result = await submitIntakeSession({
        sessionId: session.publicSessionId,
        signatureName,
      });

      const completeUrl = new URL(completeHref, window.location.origin);
      completeUrl.searchParams.set('sessionId', result.sessionId || session.publicSessionId);

      if (result.submissionId) {
        completeUrl.searchParams.set('submissionId', result.submissionId);
      }

      if (result.submittedAt) {
        completeUrl.searchParams.set('submittedAt', result.submittedAt);
      }

      router.push(`${completeUrl.pathname}${completeUrl.search}`);
    } catch (error) {
      const nextError = error as Error & { validation?: IntakeValidationSummary };
      setSubmitError(nextError.message || 'Unable to submit intake session.');
      setSubmitValidation(nextError.validation);
      setSubmitState('error');
    }
  }

  if (loadingState === 'loading') {
    return <StateCard title="Loading review" description="Fetching the latest saved intake answers and completeness state." />;
  }

  if (loadingState === 'error' || !session) {
    return (
      <div className="space-y-6">
        <StateCard title="Unable to load review" description={loadError || 'This review screen could not be loaded.'} tone="warning" />
        <SessionActions primaryLabel="Back to intake" primaryHref={sessionHref} secondaryLabel="Back to start" secondaryHref={startHref} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StateCard
        title={reviewState.readyToSubmit ? 'Ready to submit' : 'Almost ready'}
        description={
          reviewState.readyToSubmit
            ? 'All required intake answers are present and valid. Submit when you are ready to complete check-in.'
            : 'Review the missing or invalid items below, then return to the matching section to finish intake.'
        }
        tone={reviewState.readyToSubmit ? 'success' : 'warning'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Public ID: {session.publicSessionId}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{session.completionSummary.completedFields} of {session.completionSummary.totalFields} fields complete</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{displayedIssues.length} issue{displayedIssues.length === 1 ? '' : 's'} to fix</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Updated {new Date(session.updatedAt).toLocaleTimeString()}</span>
        </div>
      </StateCard>

      {submitState === 'error' ? (
        <StateCard
          title="We couldn’t submit your intake yet"
          description={submitError || 'Some information still needs attention before check-in can be completed.'}
          tone="warning"
        >
          <div className="space-y-3">
            <p className="text-sm leading-6 text-amber-900">
              Please review the items below and return to the matching section to finish your check-in.
            </p>
            {displayedIssues.length > 0 ? (
              <ul className="space-y-2 text-sm text-amber-900">
                {displayedIssues.map((issue) => (
                  <li key={`submit-error-${issue.key}`} className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{issue.label}</p>
                      <p className="text-slate-600">{issue.detail}</p>
                    </div>
                    <Link
                      href={getSectionHref(sessionHref, issue.anchor)}
                      className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-400"
                    >
                      Fix {issue.sectionLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </StateCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Required field summary</h2>
          {displayedIssues.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-emerald-700">Every required field is satisfied. The patient can submit their intake now.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {displayedIssues.map((issue) => (
                <li key={issue.key} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{issue.label}</p>
                      <p className="mt-1 text-sm text-slate-600">{issue.detail}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{issue.type} • {issue.sectionLabel}</p>
                    </div>
                    <Link
                      href={getSectionHref(sessionHref, issue.anchor)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                    >
                      Fix in section
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-950">Section status</h2>
          <div className="space-y-3">
            {session.sections.map((section) => {
              const sectionIssues = displayedIssues.filter((issue) => issue.sectionKey === section.key);
              const isComplete = sectionIssues.length === 0 && section.incompleteRequiredFields.length === 0;
              const anchor =
                section.key === 'demographics'
                  ? 'section-demographics'
                  : section.key === 'visit_reason'
                    ? 'section-visit-reason'
                    : 'section-consent';

              return (
                <div key={section.key} className={`rounded-2xl border px-4 py-4 ${isComplete ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{section.label}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {isComplete ? 'Required fields complete.' : `${Math.max(section.incompleteRequiredFields.length, sectionIssues.length)} required item${Math.max(section.incompleteRequiredFields.length, sectionIssues.length) === 1 ? '' : 's'} still need attention.`}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isComplete ? 'bg-white text-emerald-700' : 'bg-white text-amber-700'}`}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  {sectionIssues.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {sectionIssues.map((issue) => (
                        <li key={`${section.key}-${issue.key}`}>• {issue.label}</li>
                      ))}
                    </ul>
                  ) : null}
                  <Link href={getSectionHref(sessionHref, anchor)} className="mt-4 inline-flex text-sm font-semibold text-blue-700 transition hover:text-blue-900">
                    Return to {section.label.toLowerCase()} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Current answers</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {session.sections.map((section) => {
            const fields = REVIEW_FIELDS.filter((field) => field.sectionKey === section.key);
            return (
              <div key={`summary-${section.key}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">{section.label}</h3>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{section.completionState}</span>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  {fields.map((field) => {
                    const issue = displayedIssues.find((candidate) => candidate.key === field.key);
                    return (
                      <div key={field.key}>
                        <dt className="font-medium text-slate-500">{field.label}</dt>
                        <dd className={`mt-1 ${issue ? 'text-amber-700' : 'text-slate-900'}`}>
                          {field.getDisplayValue(session)}
                          {issue ? ` — ${issue.type}` : ''}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Submit intake</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              When everything looks right, submit this intake to finish check-in and receive a confirmation number.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!reviewState.readyToSubmit || submitState === 'submitting'}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitState === 'submitting' ? 'Submitting…' : 'Submit intake'}
          </button>
        </div>
        {!reviewState.readyToSubmit ? (
          <p className="mt-3 text-sm text-slate-500">
            Submission stays disabled until every required answer is complete and valid.
          </p>
        ) : null}
      </div>

      <SessionActions
        primaryLabel="Back to intake"
        primaryHref={sessionHref}
        secondaryLabel="Back to start"
        secondaryHref={startHref}
      />
    </div>
  );
}
