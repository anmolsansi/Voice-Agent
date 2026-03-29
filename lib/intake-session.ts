export type IntakeFieldState = {
  fieldKey: string;
  value: string | number | boolean | null;
  displayValue: string | null;
  completionState: string;
  lastUpdatedAt: string;
  lastUpdatedBySource: string;
};

export type IntakeSectionState = {
  key: string;
  label: string;
  completionState: string;
  requiredFields: string[];
  incompleteRequiredFields: string[];
};

export type IntakeSession = {
  id: string;
  publicSessionId: string;
  status: string;
  sourceMode: string;
  startedAt: string;
  updatedAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  completionSummary: {
    totalFields: number;
    completedFields: number;
    incompleteRequiredFields: number;
  };
  sections: IntakeSectionState[];
  fields: Record<string, IntakeFieldState>;
};

export async function createIntakeSession() {
  const response = await fetch('/api/intake/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceMode: 'manual' }),
  });

  if (!response.ok) {
    throw new Error('Unable to start intake session.');
  }

  const payload = (await response.json()) as { session: IntakeSession };
  return payload.session;
}

export async function resumeIntakeSession(publicSessionId: string) {
  const response = await fetch(
    `/api/intake/sessions/resume?publicSessionId=${encodeURIComponent(publicSessionId)}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Intake session not found.' : 'Unable to load intake session.');
  }

  const payload = (await response.json()) as { session: IntakeSession };
  return payload.session;
}

export async function saveIntakeField(input: {
  sessionId: string;
  fieldKey: string;
  value: string | number | boolean;
}) {
  const response = await fetch('/api/intake/fields', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: input.sessionId,
      fieldKey: input.fieldKey,
      value: input.value,
      source: 'manual',
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || 'Unable to save intake field.');
  }

  return response.json() as Promise<{
    sessionId: string;
    field: IntakeFieldState;
    section: IntakeSectionState;
    sessionStatus: string;
  }>;
}

export function getFieldStringValue(session: IntakeSession | null, fieldKey: string) {
  const value = session?.fields[fieldKey]?.value;
  return typeof value === 'string' ? value : '';
}

export function getFieldBooleanValue(session: IntakeSession | null, fieldKey: string) {
  return session?.fields[fieldKey]?.value === true;
}

export function getSection(session: IntakeSession | null, sectionKey: string) {
  return session?.sections.find((section) => section.key === sectionKey) ?? null;
}
