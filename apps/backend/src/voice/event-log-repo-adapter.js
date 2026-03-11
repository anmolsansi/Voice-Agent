function buildVoiceEventLogBatchInsert(auditInserts = []) {
  if (!Array.isArray(auditInserts)) throw new Error('auditInserts_array_required');

  const valid = auditInserts.filter((q) => q && typeof q.text === 'string' && Array.isArray(q.values));
  return {
    statementCount: valid.length,
    statements: valid,
  };
}

module.exports = {
  buildVoiceEventLogBatchInsert,
};
