export const dashboardStats = [
  { label: 'Patients waiting', value: '12' },
  { label: 'In progress', value: '5' },
  { label: 'Needs attention', value: '2' },
];

export const intakeQueueItems = [
  {
    id: 'demo-session',
    patientName: 'Jordan Lee',
    status: 'Waiting review',
    priority: 'High',
    submittedAt: '5 min ago',
    concern: 'Insurance capture pending.',
  },
  {
    id: 'session-2048',
    patientName: 'Taylor Brooks',
    status: 'Assigned',
    priority: 'Routine',
    submittedAt: '12 min ago',
    concern: 'Medication review pending.',
  },
  {
    id: 'session-2051',
    patientName: 'Morgan Chen',
    status: 'Escalated',
    priority: 'Urgent',
    submittedAt: '18 min ago',
    concern: 'Interpreter requested.',
  },
];
