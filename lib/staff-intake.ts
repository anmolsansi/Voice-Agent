import { IntakeSession } from '@/lib/intake-session';

export function getPatientName(session: IntakeSession) {
  const firstName = getSessionFieldDisplayValue(session, 'patient.firstName');
  const lastName = getSessionFieldDisplayValue(session, 'patient.lastName');
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Unknown patient';
}

export function getSessionFieldDisplayValue(session: IntakeSession, fieldKey: string) {
  const field = session.fields[fieldKey];

  if (!field) {
    return 'Not provided';
  }

  if (field.displayValue) {
    return field.displayValue;
  }

  if (typeof field.value === 'boolean') {
    return field.value ? 'Yes' : 'No';
  }

  if (field.value === null || field.value === undefined || field.value === '') {
    return 'Not provided';
  }

  return String(field.value);
}

export function formatSessionDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

export function formatCompletionSummary(session: IntakeSession) {
  const { completedFields, totalFields, incompleteRequiredFields } = session.completionSummary;
  const completeLabel = `${completedFields}/${totalFields} fields complete`;

  if (incompleteRequiredFields === 0) {
    return `${completeLabel} · All required fields complete`;
  }

  return `${completeLabel} · ${incompleteRequiredFields} required field${incompleteRequiredFields === 1 ? '' : 's'} remaining`;
}

export function getStatusTone(status: string) {
  if (status === 'reviewed') {
    return 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30';
  }

  return status === 'submitted'
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
    : 'bg-amber-500/15 text-amber-200 border-amber-500/30';
}
