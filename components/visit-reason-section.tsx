'use client';

import { ChangeEvent, useMemo } from 'react';

import { CheckboxField, FormSection, TextareaField, TextField } from '@/components/form-fields';
import { StateCard } from '@/components/state-card';
import { type IntakeSectionState } from '@/lib/intake-session';

type VisitReasonValues = {
  chiefComplaint: string;
  symptomDuration: string;
  feverPresent: boolean;
  injuryRelated: boolean;
};

type SaveState = Record<string, 'idle' | 'saving' | 'saved' | 'error'>;

type VisitReasonSectionProps = {
  values: VisitReasonValues;
  sectionState: IntakeSectionState | null;
  saveState: SaveState;
  onFieldChange: (fieldKey: string, value: string | boolean) => void;
};

const REQUIRED_FIELD_KEYS: Array<keyof VisitReasonValues> = ['chiefComplaint'];

function getRequiredError(value: string, required?: boolean) {
  if (!required) return undefined;
  return value.trim() ? undefined : 'This field is required for intake completion.';
}

export function VisitReasonSection({ values, sectionState, saveState, onFieldChange }: VisitReasonSectionProps) {
  const requiredRemaining = useMemo(() => REQUIRED_FIELD_KEYS.filter((fieldKey) => !String(values[fieldKey]).trim()).length, [values]);
  const completionState = requiredRemaining === 0 ? 'Ready for review' : `${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} left`;

  function handleTextChange(key: 'chiefComplaint' | 'symptomDuration') {
    return (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const fieldKey = key === 'chiefComplaint' ? 'visit.chiefComplaint' : 'visit.symptomDuration';
      onFieldChange(fieldKey, event.target.value);
    };
  }

  function handleCheckboxChange(key: 'feverPresent' | 'injuryRelated') {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const fieldKey = key === 'feverPresent' ? 'visit.feverPresent' : 'visit.injuryRelated';
      onFieldChange(fieldKey, event.target.checked);
    };
  }

  return (
    <div className="space-y-6">
      <StateCard
        title="Visit reason / chief complaint"
        description="This MVP section stays tightly focused on why the patient is here today. Required versus optional symptom details remain clear, and saved values come back when the session reloads."
        tone={requiredRemaining === 0 ? 'success' : 'default'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Required fields marked *</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionState}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Section key: visit_reason</span>
          {sectionState ? <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Backend state: {sectionState.completionState}</span> : null}
          {saveState['visit.chiefComplaint'] === 'saving' ? <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Saving…</span> : null}
        </div>
      </StateCard>

      <FormSection title="Why are you visiting today?" description="Capture the frozen MVP visit reason fields only. This branch saves the core reason plus a couple of lightweight follow-up details without expanding into the later review or submission flow.">
        <div className="grid gap-5">
          <TextareaField name="visit.chiefComplaint" label="Chief complaint" required hint="Required for MVP. Describe the main reason for this visit in the patient’s own words when possible." placeholder="Example: Sore throat and fever since yesterday" rows={4} value={values.chiefComplaint} error={getRequiredError(values.chiefComplaint, true)} onChange={handleTextChange('chiefComplaint')} />

          <TextField name="visit.symptomDuration" label="How long have you had these symptoms?" hint="Optional free-text duration field supported by the current backend schema." placeholder="Example: Since yesterday morning" value={values.symptomDuration} onChange={handleTextChange('symptomDuration')} />

          <div className="grid gap-4 md:grid-cols-2">
            <CheckboxField name="visit.feverPresent" label="I have had a fever with this issue" description="Optional quick flag for the current visit." checked={values.feverPresent} onChange={handleCheckboxChange('feverPresent')} />
            <CheckboxField name="visit.injuryRelated" label="This visit is related to an injury" description="Optional quick flag to help staff route the visit." checked={values.injuryRelated} onChange={handleCheckboxChange('injuryRelated')} />
          </div>
        </div>
      </FormSection>
    </div>
  );
}
