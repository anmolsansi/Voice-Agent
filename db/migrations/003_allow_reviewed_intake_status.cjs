/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropConstraint('intake_session_state', 'intake_session_state_status_check', { ifExists: true });
  pgm.addConstraint('intake_session_state', 'intake_session_state_status_check', {
    check: "status in ('active', 'submitted', 'reviewed')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('intake_session_state', 'intake_session_state_status_check', { ifExists: true });
  pgm.addConstraint('intake_session_state', 'intake_session_state_status_check', {
    check: "status in ('active', 'submitted')",
  });
};
