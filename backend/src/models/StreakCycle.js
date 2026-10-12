const mongoose = require('mongoose');

const streakCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleNumber: { type: Number, required: true }, // 1, 2, 3... per user
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'RESET'], default: 'ACTIVE' },
    currentDay: { type: Number, default: 1 }, // next claimable day in this cycle
    lastClaimedAt: { type: Date, default: null },
    nextClaimAt: { type: Date, default: null }, // null = claimable now
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Only one ACTIVE cycle per user at a time.
streakCycleSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
