const { intakeFieldMetadata, intakeSections } = require('./field-metadata');
const { validateForm } = require('./validation');

function buildSectionNavigation(currentSectionId) {
  return intakeSections.map((section, index) => ({
    id: section.id,
    title: section.title,
    stepNumber: index + 1,
    active: section.id === currentSectionId,
  }));
}

function buildProgress(currentSectionId) {
  const idx = intakeSections.findIndex((s) => s.id === currentSectionId);
  const currentStep = idx >= 0 ? idx + 1 : 1;
  return {
    currentStep,
    totalSteps: intakeSections.length,
    percentComplete: Math.round((currentStep / intakeSections.length) * 100),
  };
}

function buildSectionViewModel(sectionId, formData = {}) {
  const section = intakeSections.find((item) => item.id === sectionId) || intakeSections[0];
  const errors = validateForm(formData);

  return {
    sectionId: section.id,
    title: section.title,
    fields: section.fields.map((fieldKey) => {
      const metadata = intakeFieldMetadata[fieldKey];
      return {
        key: fieldKey,
        label: metadata.label,
        helperText: metadata.helperText,
        required: metadata.required,
        requiredIndicator: metadata.required ? 'Required' : 'Optional',
        value: formData[fieldKey] ?? '',
        error: errors[fieldKey] || null,
      };
    }),
    sectionNavigation: buildSectionNavigation(section.id),
    progress: buildProgress(section.id),
  };
}

function buildReviewScreen(formData = {}) {
  const errors = validateForm(formData);
  const missingRequiredFields = Object.entries(errors)
    .filter(([fieldKey]) => intakeFieldMetadata[fieldKey]?.required)
    .map(([fieldKey, message]) => ({ fieldKey, message }));

  return {
    heading: 'Review Intake Information',
    values: Object.keys(intakeFieldMetadata).map((fieldKey) => ({
      fieldKey,
      label: intakeFieldMetadata[fieldKey].label,
      value: formData[fieldKey] ?? '',
      required: intakeFieldMetadata[fieldKey].required,
    })),
    missingRequiredFields,
    canSubmit: missingRequiredFields.length === 0,
  };
}

module.exports = {
  buildSectionViewModel,
  buildReviewScreen,
};
