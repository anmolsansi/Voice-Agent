'use client';

import { ChangeEvent, useMemo } from 'react';

import { CheckboxField, FormSection, TextField } from '@/components/form-fields';
import { StateCard } from '@/components/state-card';
import { type IntakeSectionState } from '@/lib/intake-session';

type ConsentValues = {
  treatmentConsent: boolean;
  hipaaAcknowledgment: boolean;
  financialResponsibility: boolean;
  signatureName: string;
  signedAt: string;
};

type SaveState = Record<string, 'idle' | 'saving' | 'saved' | 'error'>;

type ConsentSectionProps = {
  values: ConsentValues;
  sectionState: IntakeSectionState | null;
  saveState: SaveState;
  onFieldChange: (fieldKey: string, value: string | boolean) => void;
};

const CONSENT_CHECKBOX_FIELDS: Array<{
  key: 'treatmentConsent' | 'hipaaAcknowledgment' | 'financialResponsibility';
  name: `consent.${string}`;
  label: string;
  required?: boolean;
  description: string;
}> = [
  { key: 'treatmentConsent', name: 'consent.treatmentConsent', label: 'I consent to evaluation and treatment', required: true, description: 'Required before intake can be submitted.' },
  { key: 'hipaaAcknowledgment', name: 'consent.hipaaAcknowledgment', label: 'I acknowledge receipt/availability of HIPAA privacy practices', description: 'Optional for this intake submission. Staff may still review it as part of clinic workflows.' },
  { key: 'financialResponsibility', name: 'consent.financialResponsibility', label: 'I accept financial responsibility for services rendered', description: 'Optional for this intake form.' },
];

function getRequiredCheckboxError(checked: boolean, required?: boolean) {
  if (!required || checked) return undefined;
  return 'This acknowledgment is required before intake submission.';
}

function getRequiredTextError(value: string) {
  return value.trim() ? undefined : 'Please enter your full name to sign this acknowledgment.';
}

export function ConsentSection({ values, sectionState, saveState, onFieldChange }: ConsentSectionProps) {
  const requiredRemaining = useMemo(() => {
    let remaining = 0;
    if (!values.treatmentConsent) remaining += 1;
    if (!values.signatureName.trim()) remaining += 1;
    return remaining;
  }, [values]);

  const completionState = requiredRemaining === 0 ? 'Ready for review' : `${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} left`;

  function handleCheckboxChange(key: 'treatmentConsent' | 'hipaaAcknowledgment' | 'financialResponsibility') {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onFieldChange(`consent.${key}`, event.target.checked);
    };
  }

  function handleSignatureChange(event: ChangeEvent<HTMLInputElement>) {
    onFieldChange('consent.signatureName', event.target.value);
  }

  return (
    <div id="section-consent" className="space-y-6 scroll-mt-6">
      <StateCard
        title="Consent and privacy acknowledgment"
        description="Review the required treatment consent, optional HIPAA/privacy acknowledgment, and signature for this intake. The signed timestamp is added automatically after the signature name is saved."
        tone={requiredRemaining === 0 ? 'success' : 'warning'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Required fields marked *</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionState}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Section key: consent</span>
          {sectionState ? <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Backend state: {sectionState.completionState}</span> : null}
        </div>
      </StateCard>

      <FormSection title="Review and sign" description="Complete the treatment consent and signature needed to submit this intake. The HIPAA/privacy acknowledgment is available here when the clinic wants it recorded.">
        <div className="grid gap-4">
          {CONSENT_CHECKBOX_FIELDS.map((field) => (
            <CheckboxField key={field.key} name={field.name} label={field.label} required={field.required} description={field.description} checked={values[field.key]} error={getRequiredCheckboxError(values[field.key], field.required)} onChange={handleCheckboxChange(field.key)} />
          ))}

          <TextField name="consent.signatureName" label="Signature (full name)" required hint="Type the patient’s full name to sign this intake." placeholder="Jordan Lee" value={values.signatureName} error={getRequiredTextError(values.signatureName)} onChange={handleSignatureChange} />

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
            <p className="font-semibold text-slate-700">Signature timestamp</p>
            <p className="mt-1">
              <code className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">consent.signedAt</code> is generated by the backend after the signature name is saved.
            </p>
            <p className="mt-2 text-xs text-slate-600">{values.signedAt ? `Signed at ${new Date(values.signedAt).toLocaleString()}` : 'No backend signature timestamp yet.'}</p>
            {saveState['consent.signatureName'] === 'saving' ? <p className="mt-2 text-xs text-slate-600">Saving signature…</p> : null}
          </div>
        </div>
      </FormSection>
    </div>
  );
}
