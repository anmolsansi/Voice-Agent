const PDFDocument = require('pdfkit');

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getFieldValue(session, fieldKey, fallback = 'Not provided') {
  const value = session.fields[fieldKey] ? session.fields[fieldKey].value : null;

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function buildPatientName(session) {
  const firstName = getFieldValue(session, 'patient.firstName', '').trim();
  const lastName = getFieldValue(session, 'patient.lastName', '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Not provided';
}

function createSection(doc, title) {
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(title);
  doc.moveDown(0.4);
}

function createRow(doc, label, value) {
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(label, { continued: true });
  doc.font('Helvetica').text(` ${value}`);
}

function generateIntakeSessionPdf(session) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER', compress: false });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.info.Title = `Intake Summary ${session.publicSessionId}`;
    doc.info.Author = 'CheckIn Care';
    doc.info.Subject = 'Clinical intake summary';

    doc.font('Helvetica-Bold').fontSize(20).fillColor('#111827').text('CheckIn Care Intake Summary');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('#374151');
    doc.text(`Session ID: ${session.publicSessionId}`);
    doc.text(`Submission timestamp: ${formatDateTime(session.submittedAt)}`);

    createSection(doc, 'Patient Information');
    createRow(doc, 'Patient name:', buildPatientName(session));
    createRow(doc, 'Date of birth:', getFieldValue(session, 'patient.dateOfBirth'));
    createRow(doc, 'Sex at birth:', getFieldValue(session, 'patient.sexAtBirth'));
    createRow(doc, 'Phone:', getFieldValue(session, 'patient.phone'));
    createRow(doc, 'Email:', getFieldValue(session, 'patient.email'));

    createSection(doc, 'Visit Reason');
    createRow(doc, 'Chief complaint:', getFieldValue(session, 'visit.chiefComplaint'));
    createRow(doc, 'Symptom duration:', getFieldValue(session, 'visit.symptomDuration'));
    createRow(doc, 'Pain present:', getFieldValue(session, 'visit.painPresent'));
    createRow(doc, 'Pain score:', getFieldValue(session, 'visit.painScore'));
    createRow(doc, 'Fever present:', getFieldValue(session, 'visit.feverPresent'));
    createRow(doc, 'Injury related:', getFieldValue(session, 'visit.injuryRelated'));

    createSection(doc, 'Consent');
    createRow(doc, 'Treatment consent confirmed:', getFieldValue(session, 'consent.treatmentConsent'));
    createRow(doc, 'HIPAA acknowledgment:', getFieldValue(session, 'consent.hipaaAcknowledgment'));
    createRow(doc, 'Financial responsibility:', getFieldValue(session, 'consent.financialResponsibility'));
    createRow(doc, 'Signed by:', getFieldValue(session, 'consent.signatureName'));
    createRow(doc, 'Signed at:', formatDateTime(session.fields['consent.signedAt'] ? session.fields['consent.signedAt'].value : null));

    doc.end();
  });
}

module.exports = {
  generateIntakeSessionPdf,
};
