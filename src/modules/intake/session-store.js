class IntakeSessionStore {
  constructor() {
    this.sessions = new Map();
  }

  save(session) {
    this.sessions.set(session.id, session);
    return session;
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
