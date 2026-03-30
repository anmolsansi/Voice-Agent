'use client';

import { ChangeEvent, useMemo } from 'react';

import { DateField, FormSection, SelectField, TextField } from '@/components/form-fields';
import { StateCard } from '@/components/state-card';
import { type IntakeSectionState } from '@/lib/intake-session';

type DemographicsValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sexAtBirth: string;
  sexAtBirthSelfDescribe: string;
  genderIdentity: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  preferredLanguage: string;
};

type SaveState = Record<string, 'idle' | 'saving' | 'saved' | 'error'>;

type FieldDefinition = {
  key: keyof DemographicsValues;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'tel' | 'email';
};

type DemographicsSectionProps = {
  values: DemographicsValues;
  sectionState: IntakeSectionState | null;
  saveState: SaveState;
  onFieldChange: (fieldKey: string, value: string) => void;
};

const REQUIRED_FIELD_KEYS: Array<keyof DemographicsValues> = ['firstName', 'lastName', 'dateOfBirth', 'sexAtBirth', 'phone'];
const BASIC_FIELDS: FieldDefinition[] = [
  { key: 'firstName', label: 'First name', required: true, placeholder: 'Jordan' },
  { key: 'lastName', label: 'Last name', required: true, placeholder: 'Lee' },
  { key: 'genderIdentity', label: 'Gender identity', placeholder: 'Woman, man, nonbinary, etc.', hint: 'Optional free-text entry for how you identify.' },
  { key: 'phone', label: 'Phone number', required: true, type: 'tel', placeholder: '(555) 123-4567' },
  { key: 'email', label: 'Email address', type: 'email', placeholder: 'jordan@example.com', hint: 'Optional, but helpful for follow-up instructions.' },
];
const ADDRESS_FIELDS: FieldDefinition[] = [
  { key: 'addressLine1', label: 'Address line 1', placeholder: '123 Main St' },
  { key: 'addressLine2', label: 'Address line 2', placeholder: 'Apartment, suite, unit, etc.' },
  { key: 'city', label: 'City', placeholder: 'Chicago' },
  { key: 'state', label: 'State', placeholder: 'Illinois', hint: 'Shown once any address detail is entered.' },
  { key: 'postalCode', label: 'ZIP code', placeholder: '60601' },
];
const sexAtBirthOptions = [
  { label: 'Select sex at birth', value: '' },
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Intersex', value: 'intersex' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  { label: 'Self describe', value: 'self_describe' },
];
const preferredLanguageOptions = [
  { label: 'Select preferred language', value: '' },
  { label: 'English', value: 'english' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'Polish', value: 'polish' },
  { label: 'Mandarin', value: 'mandarin' },
  { label: 'Other', value: 'other' },
];

function getRequiredError(value: string, required?: boolean) {
  if (!required) return undefined;
  return value.trim() ? undefined : 'This field is required for intake completion.';
}

function getSaveBadge(fieldKey: string, saveState: SaveState) {
  const state = saveState[fieldKey] || 'idle';
  if (state === 'saving') return 'Saving…';
  if (state === 'saved') return 'Saved';
  if (state === 'error') return 'Error';
  return null;
}

export function DemographicsSection({ values, sectionState, saveState, onFieldChange }: DemographicsSectionProps) {
  const addressInUse = Boolean(values.addressLine1 || values.addressLine2 || values.city || values.state || values.postalCode);

  const requiredRemaining = useMemo(() => REQUIRED_FIELD_KEYS.filter((fieldKey) => !values[fieldKey].trim()).length, [values]);
  const completionState = requiredRemaining === 0 ? 'Ready for review' : `${requiredRemaining} required field${requiredRemaining === 1 ? '' : 's'} left`;

  function handleTextChange(key: keyof DemographicsValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onFieldChange(`patient.${key}`, event.target.value);
    };
  }

  return (
    <div id="section-demographics" className="space-y-6 scroll-mt-6">
      <StateCard
        title="Demographics / Contact basics"
        description="MVP fields are rendered from the frozen intake schema. Required items stay obvious, optional contact details stay lightweight, and conditional inputs only appear when relevant."
        tone={requiredRemaining === 0 ? 'success' : 'default'}
      >
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Required fields marked *</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">{completionState}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Section key: demographics</span>
          {sectionState ? <span className="rounded-full bg-white/80 px-3 py-1 text-slate-700">Backend state: {sectionState.completionState}</span> : null}
        </div>
      </StateCard>

      <FormSection
        title="Patient details"
        description="Collect the core contact and identity details needed to begin the visit. Changes save directly to the intake session as you type or select values."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {BASIC_FIELDS.slice(0, 2).map((field) => (
            <TextField key={field.key} name={`patient.${field.key}`} label={field.label} required={field.required} hint={field.hint} type={field.type} placeholder={field.placeholder} value={values[field.key]} error={getRequiredError(values[field.key], field.required)} onChange={handleTextChange(field.key)} />
          ))}

          <DateField name="patient.dateOfBirth" label="Date of birth" required hint="Must be a valid past date. Server-side validation remains the source of truth." value={values.dateOfBirth} error={getRequiredError(values.dateOfBirth, true)} onChange={handleTextChange('dateOfBirth')} max={new Date().toISOString().split('T')[0]} />

          <SelectField name="patient.sexAtBirth" label="Sex at birth" required hint="MVP enum values follow the shared schema freeze." options={sexAtBirthOptions} value={values.sexAtBirth} error={getRequiredError(values.sexAtBirth, true)} onChange={handleTextChange('sexAtBirth')} />

          {values.sexAtBirth === 'self_describe' ? <TextField name="patient.sexAtBirthSelfDescribe" label="Describe sex at birth" hint="Shown only when self describe is selected above." placeholder="Describe in your own words" value={values.sexAtBirthSelfDescribe} onChange={handleTextChange('sexAtBirthSelfDescribe')} className="md:col-span-2" /> : null}

          {BASIC_FIELDS.slice(2).map((field) => (
            <TextField key={field.key} name={`patient.${field.key}`} label={field.label} required={field.required} hint={field.hint} type={field.type} placeholder={field.placeholder} value={values[field.key]} error={getRequiredError(values[field.key], field.required)} onChange={handleTextChange(field.key)} />
          ))}

          <SelectField name="patient.preferredLanguage" label="Preferred language" options={preferredLanguageOptions} value={values.preferredLanguage} onChange={handleTextChange('preferredLanguage')} className="md:col-span-2" />
        </div>
      </FormSection>

      <FormSection title="Address" description="Address details are optional in MVP. State and ZIP appear once address entry begins so the section does not feel heavier than necessary.">
        <div className="grid gap-5 md:grid-cols-2">
          {ADDRESS_FIELDS.slice(0, 3).map((field) => (
            <TextField key={field.key} name={`patient.${field.key}`} label={field.label} hint={field.hint} placeholder={field.placeholder} value={values[field.key]} onChange={handleTextChange(field.key)} />
          ))}

          {addressInUse ? ADDRESS_FIELDS.slice(3).map((field) => <TextField key={field.key} name={`patient.${field.key}`} label={field.label} hint={field.hint} placeholder={field.placeholder} value={values[field.key]} onChange={handleTextChange(field.key)} />) : <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-500 md:col-span-2">Add an address if you want staff to have mailing details on file. State and ZIP will appear after you begin entering the address.</div>}
        </div>
      </FormSection>

      <p className="text-xs text-slate-500">{getSaveBadge('patient.phone', saveState) || getSaveBadge('patient.firstName', saveState) || 'Fields save to the live intake session as you edit them.'}</p>
    </div>
  );
}
