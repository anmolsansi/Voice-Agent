'use client';

import { ChangeEvent, useMemo, useState } from 'react';

import { FormSection, TextareaField } from '@/components/form-fields';
import { StateCard } from '@/components/state-card';

type VisitReasonValues = {
  chiefComplaint: string;
  symptomSummary: string;
};

type VisitReasonFieldDefinition = {
  key: keyof VisitReasonValues;
  name: `visit.${string}`;
  label: string;
  required?: boolean;
  hint: string;
  placeholder: string;
  rows?: number;
};

const VISIT_REASON_FIELDS: VisitReasonFieldDefinition[] = [
  {
    key: 'chiefComplaint',
    name: 'visit.chiefComplaint',
    label: 'Chief complaint',
    required: true,
    hint: 'Required for MVP. Describe the main reason for this visit in the patient’s own words when possible.',
    placeholder: 'Example: Sore throat and fever since yesterday',
    rows: 4,
  },
  {
    key: 'symptomSummary',
    name: 'visit.symptomSummary',
    label: 'Symptom summary',
    hint: 'Optional details such as when symptoms started, severity, or anything that makes them better or worse.',
    placeholder: 'Example: Fever started last night, throat pain is worse when swallowing',
    rows: 5,
  },
];

const REQUIRED_FIELD_KEYS: Array<keyof VisitReasonValues> = ['chiefComplaint'];

const initialValues: VisitReasonValues = {
  chiefComplaint: '',
  symptomSummary: '',
};

function getRequiredError(value: string, required?: boolean) {
  if (!required) return undefined;
  return value.trim() ? undefined : 'This field is required for intake completion.';
}

export function VisitReasonSection() {
  const [values, setValues] = useState<VisitReasonValues>(initialValues);

  const requiredRemaining = useMemo(
    () => REQUIRED_FIELD_KEYS.filter((fieldKey) => !values[fieldKey].trim()).length,
    [values],
  );

  const completionState =
    requiredRemaining === 0
      ? 'Ready for review'
      : `${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} left`;

  function handleChange(key: keyof VisitReasonValues) {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      setValues((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };
  }

  return (
    <div className="space-y-6">
      <StateCard
        title="Visit reason / chief complaint"
        description="This MVP section stays tightly focused on why the patient is here today. Required versus optional symptom details remain clear, and the fields reuse the same shared input primitives as the demographics section."
        tone={requiredRemaining === 0 ? 'success' : 'default'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Required fields marked *</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionState}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Section key: symptoms</span>
        </div>
      </StateCard>

      <FormSection
        title="Why are you visiting today?"
        description="Capture the frozen MVP visit reason fields only. Consent, HIPAA acknowledgements, and richer clinical branching remain out of scope for this task."
      >
        <div className="grid gap-5">
          {VISIT_REASON_FIELDS.map((field) => (
            <TextareaField
              key={field.key}
              name={field.name}
              label={field.label}
              required={field.required}
              hint={field.hint}
              placeholder={field.placeholder}
              rows={field.rows}
              value={values[field.key]}
              error={getRequiredError(values[field.key], field.required)}
              onChange={handleChange(field.key)}
            />
          ))}
        </div>
      </FormSection>
    </div>
  );
}
