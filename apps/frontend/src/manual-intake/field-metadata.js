// Mirrors backend intake keys from PR #3 to keep frontend/backend aligned.
const intakeFieldMetadata = {
  first_name: { required: true, label: 'First Name', helperText: 'Enter legal first name.' },
  last_name: { required: true, label: 'Last Name', helperText: 'Enter legal last name.' },
  date_of_birth: { required: true, label: 'Date of Birth', helperText: 'Use YYYY-MM-DD format.' },
  phone: { required: false, label: 'Phone Number', helperText: 'Optional mobile or home contact.' },
  insurance_member_id: { required: false, label: 'Insurance Member ID', helperText: 'Optional for self-pay visits.' },
  chief_complaint: { required: true, label: 'Chief Complaint', helperText: 'Describe the main reason for this visit.' },
  symptom_summary: { required: false, label: 'Symptom Summary', helperText: 'Optional details such as duration or severity.' },
};

const intakeSections = [
  {
    id: 'patient_identity',
    title: 'Patient Identity',
    fields: ['first_name', 'last_name', 'date_of_birth'],
  },
  {
    id: 'contact',
    title: 'Contact',
    fields: ['phone'],
  },
  {
    id: 'insurance_basics',
    title: 'Insurance Basics',
    fields: ['insurance_member_id'],
  },
  {
    id: 'symptoms',
    title: 'Symptoms and Chief Complaint',
    fields: ['chief_complaint', 'symptom_summary'],
  },
];

module.exports = {
  intakeFieldMetadata,
  intakeSections,
};
