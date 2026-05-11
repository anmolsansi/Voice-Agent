const { createCallAttempt, listEligibleSchedules } = require('../modules/calls/service');

async function enqueueEligibleCheckInCalls(options = {}) {
  const now = options.now || new Date().toISOString();
  const schedules = options.schedules || await listEligibleSchedules(now);
  const results = [];

  for (const schedule of schedules) {
    if (!schedule.patientId) {
      results.push({
        scheduleId: schedule.id,
        status: 'skipped',
        reason: 'UNAVAILABLE_PATIENT_PROFILE',
        errorDetails: {
          code: 'UNAVAILABLE_PATIENT_PROFILE',
          message: 'Schedule does not include a patient profile reference.',
          retryable: false,
        },
      });
      continue;
    }

    const idempotencyKey = `checkin:${schedule.id}:${schedule.nextDueAt}`;
    const result = await createCallAttempt(
      {
        patientId: schedule.patientId,
        scheduleId: schedule.id,
        idempotencyKey,
        metadata: {
          source: 'checkin-worker',
          dueAt: schedule.nextDueAt,
          timezone: schedule.timezone || 'UTC',
          retryCount: schedule.retryCount || 0,
        },
      },
      { now, actor: { type: 'worker', id: 'checkins.enqueue' } },
    );

    results.push({
      scheduleId: schedule.id,
      callId: result.call.id,
      status: result.created ? 'enqueued' : 'duplicate',
      created: result.created,
    });
  }

  return {
    evaluatedAt: now,
    evaluated: schedules.length,
    enqueued: results.filter((item) => item.status === 'enqueued').length,
    duplicates: results.filter((item) => item.status === 'duplicate').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    results,
  };
}

module.exports = {
  enqueueEligibleCheckInCalls,
};
