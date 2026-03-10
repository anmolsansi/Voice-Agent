const intakeFieldMetadata = {
  first_name: {
    required: true,
    label: 'First Name',
    maxAttempts: 3,
  },
  last_name: {
    required: true,
    label: 'Last Name',
    maxAttempts: 3,
  },
  date_of_birth: {
    required: true,
    label: 'Date of Birth',
    maxAttempts: 3,
  },
  chief_complaint: {
    required: true,
    label: 'Chief Complaint',
    maxAttempts: 3,
  },
  insurance_member_id: {
    required: false,
    label: 'Insurance Member ID',
    maxAttempts: 2,
  },
};

function getFieldConfig(fieldKey) {
  return intakeFieldMetadata[fieldKey] || null;
}

module.exports = {
  intakeFieldMetadata,
  getFieldConfig,
};
