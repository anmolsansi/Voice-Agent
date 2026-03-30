const {
  createPersistenceError,
  isMemoryFallbackAllowed,
  query,
} = require('../../lib/db/postgres');

class InMemorySessionStore {
  constructor() {
    this.sessions = new Map();
    this.submissions = new Map();
  }

  save(session) {
    this.sessions.set(session.id, clone(session));
    return clone(session);
  }

  saveSubmission(submission) {
    this.submissions.set(submission.sessionId, clone(submission));
    return clone(submission);
  }

  getSubmission(sessionId) {
    const submission = this.submissions.get(sessionId);
    return submission ? clone(submission) : null;
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? clone(session) : null;
  }

  getByPublicSessionId(publicSessionId) {
    for (const session of this.sessions.values()) {
      if (session.publicSessionId === publicSessionId) {
        return clone(session);
      }
    }

    return null;
  }

  list() {
    return Array.from(this.sessions.values()).map((session) => clone(session));
  }

  clear() {
    this.sessions.clear();
    this.submissions.clear();
  }
}

class IntakeSessionStore {
  constructor() {
    this.memory = new InMemorySessionStore();
    this.sessions = {
      clear: () => this.memory.sessions.clear(),
    };
    this.submissions = {
      clear: () => this.memory.submissions.clear(),
    };
  }

  canUseMemoryFallback() {
    return isMemoryFallbackAllowed();
  }

  handlePersistenceError(error) {
    if (this.canUseMemoryFallback()) {
      return;
    }

    throw createPersistenceError('Persistence is unavailable in this environment.', error.code || error.reason || 'DATABASE_UNAVAILABLE');
  }

  async save(session) {
    try {
      await query(
        `insert into intake_session_state (
          id,
          public_session_id,
          status,
          source_mode,
          started_at,
          updated_at,
          expires_at,
          submitted_at,
          reviewed_at,
          review_notes,
          completion_summary,
          sections,
          fields
        ) values ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7::timestamptz, $8::timestamptz, $9::timestamptz, $10, $11::jsonb, $12::jsonb, $13::jsonb)
        on conflict (id) do update set
          public_session_id = excluded.public_session_id,
          status = excluded.status,
          source_mode = excluded.source_mode,
          started_at = excluded.started_at,
          updated_at = excluded.updated_at,
          expires_at = excluded.expires_at,
          submitted_at = excluded.submitted_at,
          reviewed_at = excluded.reviewed_at,
          review_notes = excluded.review_notes,
          completion_summary = excluded.completion_summary,
          sections = excluded.sections,
          fields = excluded.fields`,
        [
          session.id,
          session.publicSessionId,
          session.status,
          session.sourceMode,
          session.startedAt,
          session.updatedAt,
          session.expiresAt,
          session.submittedAt,
          session.reviewedAt || null,
          session.reviewNotes || null,
          JSON.stringify(session.completionSummary || {}),
          JSON.stringify(session.sections || []),
          JSON.stringify(session.fields || {}),
        ],
      );
    } catch (error) {
      this.handlePersistenceError(error);
      this.memory.save(session);
      return clone(session);
    }

    this.memory.save(session);
    return clone(session);
  }

  async saveSubmission(submission) {
    try {
      await query(
        `insert into intake_session_submissions (
          submission_id,
          session_id,
          status,
          submitted_at,
          payload
        ) values ($1, $2, $3, $4::timestamptz, $5::jsonb)
        on conflict (session_id) do update set
          submission_id = excluded.submission_id,
          status = excluded.status,
          submitted_at = excluded.submitted_at,
          payload = excluded.payload`,
        [
          submission.submissionId,
          submission.sessionId,
          submission.status,
          submission.submittedAt,
          JSON.stringify(submission.payload || {}),
        ],
      );
    } catch (error) {
      this.handlePersistenceError(error);
      this.memory.saveSubmission(submission);
      return clone(submission);
    }

    this.memory.saveSubmission(submission);
    return clone(submission);
  }

  async getSubmission(sessionId) {
    try {
      const result = await query(
        `select submission_id, session_id, status, submitted_at, payload
         from intake_session_submissions
         where session_id = $1`,
        [sessionId],
      );

      if (result.rows[0]) {
        return mapSubmissionRow(result.rows[0]);
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.getSubmission(sessionId);
    }

    return this.memory.getSubmission(sessionId);
  }

  async get(sessionId) {
    try {
      const result = await query(
        `select id, public_session_id, status, source_mode, started_at, updated_at, expires_at, submitted_at, reviewed_at, review_notes, completion_summary, sections, fields
         from intake_session_state
         where id = $1`,
        [sessionId],
      );

      if (result.rows[0]) {
        const session = mapSessionRow(result.rows[0]);
        this.memory.save(session);
        return session;
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.get(sessionId);
    }

    return this.memory.get(sessionId);
  }

  async getByPublicSessionId(publicSessionId) {
    try {
      const result = await query(
        `select id, public_session_id, status, source_mode, started_at, updated_at, expires_at, submitted_at, reviewed_at, review_notes, completion_summary, sections, fields
         from intake_session_state
         where public_session_id = $1`,
        [publicSessionId],
      );

      if (result.rows[0]) {
        const session = mapSessionRow(result.rows[0]);
        this.memory.save(session);
        return session;
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.getByPublicSessionId(publicSessionId);
    }

    return this.memory.getByPublicSessionId(publicSessionId);
  }

  async list() {
    try {
      const result = await query(
        `select id, public_session_id, status, source_mode, started_at, updated_at, expires_at, submitted_at, reviewed_at, review_notes, completion_summary, sections, fields
         from intake_session_state
         order by updated_at desc`,
        [],
      );

      if (result.rows.length > 0) {
        const sessions = result.rows.map(mapSessionRow);
        sessions.forEach((session) => this.memory.save(session));
        return sessions;
      }
    } catch (error) {
      this.handlePersistenceError(error);
      return this.memory.list();
    }

    return this.memory.list();
  }

  async clearAll() {
    this.memory.clear();

    try {
      await query('truncate table intake_session_submissions, intake_session_state restart identity cascade');
    } catch (_error) {
      // Ignore in tests and local fallback mode.
    }
  }
}

function mapSessionRow(row) {
  return {
    id: row.id,
    publicSessionId: row.public_session_id,
    status: row.status,
    sourceMode: row.source_mode,
    startedAt: toIso(row.started_at),
    updatedAt: toIso(row.updated_at),
    expiresAt: toIso(row.expires_at),
    submittedAt: toIso(row.submitted_at),
    reviewedAt: toIso(row.reviewed_at),
    reviewNotes: row.review_notes || null,
    completionSummary: row.completion_summary || {},
    sections: row.sections || [],
    fields: row.fields || {},
  };
}

function mapSubmissionRow(row) {
  return {
    submissionId: row.submission_id,
    sessionId: row.session_id,
    submittedAt: toIso(row.submitted_at),
    status: row.status,
    payload: row.payload || {},
  };
}

function toIso(value) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const intakeSessionStore = new IntakeSessionStore();

module.exports = {
  IntakeSessionStore,
  intakeSessionStore,
};
