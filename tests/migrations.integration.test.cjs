const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { runner } = require('node-pg-migrate');
const path = require('node:path');
test('fresh migration order, reversible upgrade, orphan diagnostics and explicit detail mapping', async () => {
  if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL required.');
  const url = new URL(process.env.TEST_DATABASE_URL);
  const database = `foundation_migration_${process.pid}`;
  const adminUrl = new URL(url); adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() }); await admin.connect();
  await admin.query(`CREATE DATABASE ${database}`);
  url.pathname = '/' + database;
  const client = new Client({ connectionString: url.toString() });
  const migrate = (direction = 'up', count = Infinity) => runner({ databaseUrl: url.toString(), dir: path.resolve('db/migrations'), direction, count, migrationsTable: 'pgmigrations', schema: 'public', log: () => {}, checkOrder: true });
  try {
    await migrate(); await client.connect();
    const { rows } = await client.query('SELECT name FROM pgmigrations ORDER BY id');
    assert.deepEqual(rows.map((r) => r.name), ['001_initial_schema','002_intake_session_persistence','003_allow_reviewed_intake_status','004_call_detail_persistence','004_call_orchestration','005_staff_identity','006_canonical_calls']);
    await migrate('down', 1);
    await client.query("INSERT INTO checkin_schedules(id,patient_id,next_due_at) VALUES('00000000-0000-4000-8000-000000000102','orphan',now())");
    await assert.rejects(migrate(), /FOUNDATION_ORPHANS/);
    await client.query("INSERT INTO patients(id,first_name,last_name,date_of_birth) VALUES('00000000-0000-4000-8000-000000000101','Synthetic','Upgrade','1990-01-01')");
    await client.query("UPDATE checkin_schedules SET patient_id='00000000-0000-4000-8000-000000000101'");
    await client.query("INSERT INTO call_attempts(id,patient_id,schedule_id,status,attempt_number) VALUES('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','queued',1)");
    await client.query("INSERT INTO calls(public_call_id,started_at) VALUES('explicit-upgrade',now())");
    await assert.rejects(migrate(), /FOUNDATION_UNMAPPED_DETAILS/);
    await client.query("UPDATE calls SET metadata=jsonb_build_object('attemptId','00000000-0000-4000-8000-000000000103') WHERE public_call_id='explicit-upgrade'");
    await migrate();
    const { rows: [detail] } = await client.query("SELECT attempt_id FROM calls WHERE public_call_id='explicit-upgrade'");
    assert.equal(detail.attempt_id, '00000000-0000-4000-8000-000000000103');
    await assert.rejects(client.query("INSERT INTO calls(public_call_id,attempt_id,started_at) VALUES('duplicate',$1,now())", [detail.attempt_id]), { code: '23505' });
  } finally {
    await client.end();
    await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
    await admin.end();
  }
});
