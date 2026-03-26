export type IntakeStepStatus = 'complete' | 'current' | 'upcoming';

export type IntakeStepKey = 'start' | 'session' | 'review' | 'complete';

export type IntakeStep = {
  label: string;
  href: string;
  status: IntakeStepStatus;
};

const DEMO_SESSION_ID = 'demo-session';

export function getSafeSessionId(sessionId?: string) {
  return sessionId?.trim() ? sessionId : DEMO_SESSION_ID;
}

export function getIntakePath(step: IntakeStepKey, sessionId?: string) {
  const resolvedSessionId = getSafeSessionId(sessionId);

  switch (step) {
    case 'start':
      return '/intake/start';
    case 'session':
      return `/intake/${resolvedSessionId}`;
    case 'review':
      return `/intake/review?sessionId=${resolvedSessionId}`;
    case 'complete':
      return `/intake/complete?sessionId=${resolvedSessionId}`;
    default:
      return '/intake/start';
  }
}

export function buildIntakeSteps(currentStep: IntakeStepKey, sessionId?: string): IntakeStep[] {
  const stepOrder: IntakeStepKey[] = ['start', 'session', 'review', 'complete'];
  const labels: Record<IntakeStepKey, string> = {
    start: 'Start',
    session: 'Intake session',
    review: 'Review answers',
    complete: 'Complete',
  };

  const currentIndex = stepOrder.indexOf(currentStep);

  return stepOrder.map((step, index) => ({
    label: labels[step],
    href: getIntakePath(step, sessionId),
    status: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }));
}
