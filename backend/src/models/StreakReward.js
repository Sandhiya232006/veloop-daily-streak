const mongoose = require('mongoose');

const streakRewardSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, unique: true, min: 1 },
    rewardType: { type: String, enum: ['VES', 'GIFT_CARD'], required: true },
    currency: { type: String, default: 'VES' },
    amount: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    assetType: { type: String, enum: ['coin', 'gift-card', 'crown', 'gift'], default: 'coin' },
    isUltimate: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakReward', streakRewardSchema);
