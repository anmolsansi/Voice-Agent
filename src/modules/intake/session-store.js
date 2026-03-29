class IntakeSessionStore {
  constructor() {
    this.sessions = new Map();
    this.submissions = new Map();
  }

  save(session) {
    this.sessions.set(session.id, session);
    return session;
  }

  saveSubmission(submission) {
    this.submissions.set(submission.sessionId, submission);
    return submission;
  }

  getSubmission(sessionId) {
    return this.submissions.get(sessionId) || null;
  }

  get(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  getByPublicSessionId(publicSessionId) {
    for (const session of this.sessions.values()) {
      if (session.publicSessionId === publicSessionId) {
        return session;
      }
    }

    return null;
  }

  list() {
    return Array.from(this.sessions.values());
  }
}

const intakeSessionStore = new IntakeSessionStore();

module.exports = {
  IntakeSessionStore,
  intakeSessionStore,
};
