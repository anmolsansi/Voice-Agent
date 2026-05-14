export function createPatientStore(initialPatients = []) {
  return [...initialPatients];
}

export function listPatients(patients, filters = {}) {
  return patients
    .filter((patient) => (filters.includeArchived ? true : !patient.archivedAt))
    .filter((patient) => (filters.consentStatus ? patient.consentStatus === filters.consentStatus : true))
    .filter((patient) => (filters.riskLevel ? patient.riskLevel === filters.riskLevel : true))
    .filter((patient) => (filters.careProgramId ? patient.careProgramId === filters.careProgramId : true))
    .filter((patient) => {
      if (!filters.query) {
        return true;
      }
      const query = filters.query.toLowerCase();
      return `${patient.firstName} ${patient.lastName} ${patient.phoneNumber}`.toLowerCase().includes(query);
    })
    .sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`));
}

export function getPatient(patients, patientId, options = {}) {
  const patient = patients.find((record) => record.id === patientId);
  if (!patient || (!options.includeArchived && patient.archivedAt)) {
    return undefined;
  }
  return patient;
}

export function validatePatientInput(input, existingPatients = [], currentPatientId) {
  const errors = {};
  if (!input.firstName) errors.firstName = "First name is required.";
  if (!input.lastName) errors.lastName = "Last name is required.";
  if (!/^\+1\d{10}$/.test(input.phoneNumber || "")) errors.phoneNumber = "Phone number must be normalized E.164 US format.";
  if (!input.timeZone) errors.timeZone = "Time zone is required.";
  if (!input.preferredLanguage) errors.preferredLanguage = "Preferred language is required.";
  if (!input.careProgramId) errors.careProgramId = "Care program is required.";
  if (!input.assignedUserId) errors.assignedUserId = "Assigned care-team owner is required.";
  if (
    existingPatients.some(
      (patient) => patient.id !== currentPatientId && !patient.archivedAt && patient.phoneNumber === input.phoneNumber
    )
  ) {
    errors.phoneNumber = "An active patient already uses this phone number.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function createPatient(patients, input) {
  const validation = validatePatientInput(input, patients);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }
  const patient = {
    id: input.id || `patient-${slug(input.firstName)}-${slug(input.lastName)}`,
    consentStatus: "unknown",
    riskLevel: "low",
    ...input
  };
  return { ok: true, patients: [...patients, patient], patient };
}

export function updatePatient(patients, patientId, patch) {
  const existing = getPatient(patients, patientId, { includeArchived: true });
  if (!existing) {
    return { ok: false, error: "patient_not_found" };
  }
  const updated = { ...existing, ...patch, id: patientId };
  const validation = validatePatientInput(updated, patients, patientId);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }
  return {
    ok: true,
    patients: patients.map((patient) => (patient.id === patientId ? updated : patient)),
    patient: updated
  };
}

export function archivePatient(patients, patientId, archivedAt = new Date().toISOString()) {
  return updatePatient(patients, patientId, { archivedAt, consentStatus: "revoked" });
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
