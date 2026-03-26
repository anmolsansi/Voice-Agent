import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldBaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

type FieldChromeProps = FieldBaseProps & {
  id: string;
  children: ReactNode;
};

type TextFieldProps = FieldBaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

type TextareaFieldProps = FieldBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = FieldBaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: SelectOption[];
    placeholder?: string;
  };

type DateFieldProps = FieldBaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

type RadioOption = {
  label: string;
  value: string;
  hint?: string;
  disabled?: boolean;
};

type RadioGroupFieldProps = FieldBaseProps & {
  name: string;
  options: RadioOption[];
  value?: string;
};

type CheckboxFieldProps = Omit<FieldBaseProps, 'label'> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label: string;
    description?: string;
  };

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

function getFieldClasses(hasError?: boolean) {
  return cx(
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition',
    'placeholder:text-slate-400',
    hasError
      ? 'border-rose-300 ring-4 ring-rose-100 focus:border-rose-400'
      : 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100',
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
  );
}

function FieldChrome({ id, label, hint, error, required, className, children }: FieldChromeProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const description = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
        {error ? <span className="text-xs font-medium text-rose-700">Required field</span> : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-sm leading-6 text-slate-500">
          {hint}
        </p>
      ) : null}
      <div aria-describedby={description}>{children}</div>
      {error ? (
        <p id={errorId} className="text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, required, className, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name ?? 'text-field';

  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined]
          .filter(Boolean)
          .join(' ') || undefined}
        className={getFieldClasses(Boolean(error))}
        {...props}
      />
    </FieldChrome>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  required,
  className,
  id,
  rows = 4,
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? props.name ?? 'textarea-field';

  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined]
          .filter(Boolean)
          .join(' ') || undefined}
        className={cx(getFieldClasses(Boolean(error)), 'min-h-[120px] resize-y')}
        {...props}
      />
    </FieldChrome>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  id,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? props.name ?? 'select-field';

  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined]
          .filter(Boolean)
          .join(' ') || undefined}
        className={getFieldClasses(Boolean(error))}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={`${fieldId}-${option.value}`} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldChrome>
  );
}

export function DateField({ label, hint, error, required, className, id, ...props }: DateFieldProps) {
  const fieldId = id ?? props.name ?? 'date-field';

  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={fieldId}
        type="date"
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined]
          .filter(Boolean)
          .join(' ') || undefined}
        className={getFieldClasses(Boolean(error))}
        {...props}
      />
    </FieldChrome>
  );
}

export function RadioGroupField({
  label,
  hint,
  error,
  required,
  className,
  name,
  options,
  value,
}: RadioGroupFieldProps) {
  const fieldId = name;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <fieldset
      className={cx(
        'space-y-3 rounded-3xl border px-4 py-4',
        error ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60',
        className,
      )}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
    >
      <legend className="px-1 text-sm font-semibold text-slate-900">
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </legend>
      {hint ? (
        <p id={hintId} className="text-sm leading-6 text-slate-500">
          {hint}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const optionId = `${fieldId}-${option.value}`;
          const checked = value === option.value;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={cx(
                'flex cursor-pointer gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition',
                checked ? 'border-blue-300 ring-4 ring-blue-100' : 'border-slate-200 hover:border-slate-300',
                option.disabled && 'cursor-not-allowed bg-slate-50 text-slate-400',
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={checked}
                disabled={option.disabled}
                aria-invalid={Boolean(error)}
                className="mt-1 h-4 w-4 border-slate-300 text-blue-600"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-slate-900">{option.label}</span>
                {option.hint ? <span className="block text-sm text-slate-500">{option.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function CheckboxField({
  label,
  hint,
  error,
  required,
  className,
  description,
  id,
  ...props
}: CheckboxFieldProps) {
  const fieldId = id ?? props.name ?? 'checkbox-field';

  return (
    <div
      className={cx(
        'rounded-2xl border px-4 py-4',
        error ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white',
        className,
      )}
    >
      <label htmlFor={fieldId} className="flex cursor-pointer gap-3">
        <input
          id={fieldId}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={[hint ? `${fieldId}-hint` : undefined, error ? `${fieldId}-error` : undefined]
            .filter(Boolean)
            .join(' ') || undefined}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
          {...props}
        />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-slate-900">
            {label}
            {required ? <span className="ml-1 text-rose-600">*</span> : null}
          </span>
          {description ? <span className="block text-sm text-slate-500">{description}</span> : null}
          {hint ? (
            <span id={`${fieldId}-hint`} className="block text-sm text-slate-500">
              {hint}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p id={`${fieldId}-error`} className="mt-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-5 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
