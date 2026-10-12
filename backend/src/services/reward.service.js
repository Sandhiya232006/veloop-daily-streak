const StreakReward = require('../models/StreakReward');
const { CYCLE_LENGTH } = require('../config/streakConfig');

async function getAllActiveRewards() {
  const rewards = await StreakReward.find({ active: true }).sort({ day: 1 }).lean();
  return rewards;
}

async function getRewardForDay(day) {
  const reward = await StreakReward.findOne({ day, active: true }).lean();
  if (!reward) {
    throw new Error(`No active reward configured for day ${day}`);
  }
  return reward;
}

async function getTotalRewards() {
  // "Total Rewards" reflects the configured cycle length, driven by backend config,
  // not a hardcoded 7 in the frontend.
  const count = await StreakReward.countDocuments({ active: true });
  return count || CYCLE_LENGTH;
}

module.exports = { getAllActiveRewards, getRewardForDay, getTotalRewards };
