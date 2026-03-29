'use client';

import { ChangeEvent, useMemo, useState } from 'react';

import { CheckboxField, FormSection, TextField } from '@/components/form-fields';
import { StateCard } from '@/components/state-card';

type ConsentValues = {
  treatmentConsent: boolean;
  hipaaAcknowledgment: boolean;
  financialResponsibility: boolean;
  signatureName: string;
};

type ConsentCheckboxDefinition = {
  key: keyof Pick<ConsentValues, 'treatmentConsent' | 'hipaaAcknowledgment' | 'financialResponsibility'>;
  name: `consent.${string}`;
  label: string;
  required?: boolean;
  description: string;
};

const CONSENT_CHECKBOX_FIELDS: ConsentCheckboxDefinition[] = [
  {
    key: 'treatmentConsent',
    name: 'consent.treatmentConsent',
    label: 'I consent to evaluation and treatment',
    required: true,
    description: 'Required for MVP submission. This consent must be checked before intake can be submitted.',
  },
  {
    key: 'hipaaAcknowledgment',
    name: 'consent.hipaaAcknowledgment',
    label: 'I acknowledge receipt/availability of HIPAA privacy practices',
    required: true,
    description:
      'Required for MVP submission. This acknowledgment confirms the patient can access the privacy practices notice.',
  },
  {
    key: 'financialResponsibility',
    name: 'consent.financialResponsibility',
    label: 'I accept financial responsibility for services rendered',
    description: 'Optional for MVP, but included in the frozen schema for this section.',
  },
];

const initialValues: ConsentValues = {
  treatmentConsent: false,
  hipaaAcknowledgment: false,
  financialResponsibility: false,
  signatureName: '',
};

function getRequiredCheckboxError(checked: boolean, required?: boolean) {
  if (!required || checked) return undefined;
  return 'This acknowledgment is required before intake submission.';
}

function getRequiredTextError(value: string) {
  return value.trim() ? undefined : 'Please enter your full name to sign this acknowledgment.';
}

export function ConsentSection() {
  const [values, setValues] = useState<ConsentValues>(initialValues);

  const requiredRemaining = useMemo(() => {
    let remaining = 0;

    if (!values.treatmentConsent) remaining += 1;
    if (!values.hipaaAcknowledgment) remaining += 1;
    if (!values.signatureName.trim()) remaining += 1;

    return remaining;
  }, [values]);

  const completionState =
    requiredRemaining === 0
      ? 'Ready for review'
      : `${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} left`;

  function handleCheckboxChange(
    key: keyof Pick<ConsentValues, 'treatmentConsent' | 'hipaaAcknowledgment' | 'financialResponsibility'>,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [key]: event.target.checked,
      }));
    };
  }

  function handleSignatureChange(event: ChangeEvent<HTMLInputElement>) {
    setValues((current) => ({
      ...current,
      signatureName: event.target.value,
    }));
  }

  return (
    <div className="space-y-6">
      <StateCard
        title="Consent / HIPAA acknowledgment"
        description="This MVP section renders the frozen consent fields only. Required consents stay visually explicit, the signature stays lightweight, and the system-generated signing timestamp remains out of manual entry."
        tone={requiredRemaining === 0 ? 'success' : 'warning'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Required fields marked *</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionState}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Section key: consent</span>
        </div>
      </StateCard>

      <FormSection
        title="Review and sign"
        description="Capture the frozen MVP consent acknowledgments and signature only. The signed timestamp is system-generated later at signing or submit time, per the shared contract."
      >
        <div className="grid gap-4">
          {CONSENT_CHECKBOX_FIELDS.map((field) => (
            <CheckboxField
              key={field.key}
              name={field.name}
              label={field.label}
              required={field.required}
              description={field.description}
              checked={values[field.key]}
              error={getRequiredCheckboxError(values[field.key], field.required)}
              onChange={handleCheckboxChange(field.key)}
            />
          ))}

          <TextField
            name="consent.signatureName"
            label="Signature (full name)"
            required
            hint="Type the patient’s full name as an acknowledgment signature for MVP."
            placeholder="Jordan Lee"
            value={values.signatureName}
            error={getRequiredTextError(values.signatureName)}
            onChange={handleSignatureChange}
          />

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
            <p className="font-semibold text-slate-700">Signature timestamp</p>
            <p className="mt-1">
              <code className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">consent.signedAt</code>{' '}
              is part of the frozen MVP contract, but it is system-generated at signing or submit time and is not manually entered in this section.
            </p>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
