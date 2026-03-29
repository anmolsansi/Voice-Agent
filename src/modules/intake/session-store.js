class IntakeSessionStore {
  constructor() {
    this.sessions = new Map();
  }

  save(session) {
    this.sessions.set(session.id, session);
    return session;
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
