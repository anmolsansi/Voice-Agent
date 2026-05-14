import { evaluateCallEligibility } from "../services/schedules/schedule-service.mjs";
import { initiateSandboxOutboundCall } from "../voice/provider/sandbox-provider.mjs";

export function runScheduledCallJob({ patients, schedules, callSessions, now = new Date(), requestedBy = "system" }) {
  const createdCalls = [];
  const skipped = [];
  for (const schedule of schedules) {
    const patient = patients.find((item) => item.id === schedule.patientId);
    const eligibility = evaluateCallEligibility({ patient, schedule, callSessions: [...callSessions, ...createdCalls], now });
    if (!eligibility.eligible) {
      skipped.push({ scheduleId: schedule.id, patientId: schedule.patientId, reason: eligibility.reason });
      continue;
    }
    const result = initiateSandboxOutboundCall({
      patient,
      schedule,
      activeCallSessions: [...callSessions, ...createdCalls],
      now,
      requestedBy
    });
    if (result.ok) {
      createdCalls.push(result.callSession);
    } else {
      skipped.push({ scheduleId: schedule.id, patientId: schedule.patientId, reason: result.error });
    }
  }
  return {
    jobRun: {
      id: `job-run-${now.toISOString().replace(/[-:.TZ]/g, "")}`,
      ranAt: now.toISOString(),
      createdCount: createdCalls.length,
      skippedCount: skipped.length
    },
    callSessions: [...callSessions, ...createdCalls],
    createdCalls,
    skipped
  };
}
