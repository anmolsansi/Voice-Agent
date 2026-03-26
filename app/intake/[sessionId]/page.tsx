import {
  CheckboxField,
  DateField,
  FormSection,
  RadioGroupField,
  SelectField,
  TextField,
  TextareaField,
} from '@/components/form-fields';
import { buildIntakeSteps, getIntakePath } from '@/components/intake-flow';
import { PatientShell } from '@/components/patient-shell';
import { SessionActions } from '@/components/session-actions';
import { StateCard } from '@/components/state-card';

type IntakeSessionPageProps = {
  params: {
    sessionId: string;
  };
};

export default function IntakeSessionPage({ params }: IntakeSessionPageProps) {
  const { sessionId } = params;

  return (
    <PatientShell
      eyebrow="In progress"
      title="Your intake session is ready"
      description="This route is reserved for session-aware intake content. Voice transcript UI, section scaffolds, and manual entry components can mount here without changing the surrounding shell or downstream routes."
      steps={buildIntakeSteps('session', sessionId)}
      aside={
        <div className="space-y-2 text-sm leading-6 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Session placeholder</h2>
          <p>
            Session ID: <span className="font-mono text-slate-900">{sessionId}</span>
          </p>
          <p>
            This page intentionally avoids schema-specific fields while providing a clean container
            for future intake modules.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <StateCard
          title="Shared field primitives ready"
          description="These generic building blocks cover common intake controls, accessible helper text, and validation states without introducing schema-specific sections yet."
        />

        <FormSection
          title="Field preview"
          description="This preview proves the shell can host reusable patient-side inputs. Real intake schemas can compose these primitives later."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="preferredName"
              label="Preferred name"
              hint="Use the name staff should call you during the visit."
              placeholder="Jordan"
              defaultValue="Jordan"
            />
            <DateField
              name="dateOfBirth"
              label="Date of birth"
              hint="Example only — this route is still schema-agnostic."
              defaultValue="1988-04-12"
            />
            <SelectField
              name="contactMethod"
              label="Preferred contact method"
              defaultValue="text"
              options={[
                { label: 'Text message', value: 'text' },
                { label: 'Phone call', value: 'phone' },
                { label: 'Email', value: 'email' },
              ]}
            />
            <TextField
              name="memberId"
              label="Member ID"
              placeholder="ABC-12345"
              error="Enter the member ID exactly as it appears on the card."
              required
              defaultValue=""
            />
          </div>

          <TextareaField
            name="visitGoal"
            label="What would you like help with today?"
            hint="Long-form answers can stretch as needed."
            placeholder="Describe your main concern in your own words."
            defaultValue="I'd like to talk through recurring headaches and next steps."
          />

          <RadioGroupField
            name="visitMode"
            label="How would you like to complete intake?"
            hint="Voice and manual modes can share the same underlying primitives."
            value="voice"
            options={[
              { label: 'Voice first', value: 'voice', hint: 'Answer questions out loud with transcript support.' },
              { label: 'Manual entry', value: 'manual', hint: 'Type responses directly into the form.' },
            ]}
          />

          <CheckboxField
            name="consentToUpdates"
            label="Send appointment updates"
            description="Optional example of a standalone boolean input."
            hint="Validation styling also works for consent-style controls."
            defaultChecked
          />
        </FormSection>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900">What ships in this task</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Text, textarea, select, date, radio, and checkbox primitives</li>
              <li>• Shared label, hint, and error treatment</li>
              <li>• A lightweight section wrapper for future intake modules</li>
            </ul>
          </div>
          <StateCard
            title="Still intentionally generic"
            description="No actual intake section schema or persistence logic is introduced in this task."
          />
        </div>

        <SessionActions
          primaryLabel="Continue to review"
          primaryHref={getIntakePath('review', sessionId)}
          secondaryLabel="Back to start"
          secondaryHref={getIntakePath('start')}
        />
      </div>
    </PatientShell>
  );
}
