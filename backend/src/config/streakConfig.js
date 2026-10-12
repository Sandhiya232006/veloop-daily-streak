// Centralized, backend-driven streak configuration.
// Changing these values does NOT require any frontend code changes.

module.exports = {
  CYCLE_LENGTH: parseInt(process.env.STREAK_CYCLE_LENGTH || '7', 10),
  CLAIM_INTERVAL_HOURS: parseInt(process.env.STREAK_CLAIM_INTERVAL_HOURS || '24', 10),
  // Grace window after the claim interval opens, before we consider the day "missed".
  // e.g. if the next claim opens at T, the user has until T + MISS_GRACE_HOURS to claim
  // that specific day before the whole streak resets.
  MISS_GRACE_HOURS: parseInt(process.env.STREAK_MISS_GRACE_HOURS || '24', 10),
};
