const mongoose = require('mongoose');

const streakClaimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakCycle', required: true },
    day: { type: Number, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakReward', required: true },
    status: { type: String, enum: ['SUCCESS'], default: 'SUCCESS' },
    claimedAt: { type: Date, default: Date.now },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', required: true },
  },
  { timestamps: true }
);

// THE critical anti-duplicate / anti-concurrency constraint.
// Even if two requests race past application-level checks, MongoDB itself
// will reject the second insert for the same user+cycle+day.
streakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('StreakClaim', streakClaimSchema);
