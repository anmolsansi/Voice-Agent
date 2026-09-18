#!/usr/bin/env node
const { getConfig } = require('../src/config/env');
const { transaction, query, closePool } = require('../src/lib/db/postgres');
async function main() {
  if (getConfig().nodeEnv === 'production' || process.env.ALLOW_SYNTHETIC_SEED !== 'true') throw new Error('Set ALLOW_SYNTHETIC_SEED=true in a nonproduction synthetic database.');
  await transaction(async () => {
    await query("INSERT INTO patients(id,first_name,last_name,date_of_birth) VALUES('00000000-0000-4000-8000-000000000101','Synthetic','Patient','1990-01-01') ON CONFLICT(id) DO NOTHING");
    await query("INSERT INTO checkin_schedules(id,patient_id,status,next_due_at) VALUES('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000101','active',now()) ON CONFLICT(id) DO NOTHING");
  });
  console.log('Synthetic patient and schedule ready. No calls placed.');
}
main().catch((e) => { console.error(e.message); process.exitCode = 1; }).finally(closePool);
