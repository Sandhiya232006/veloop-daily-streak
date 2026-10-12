require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const StreakReward = require('../src/models/StreakReward');

const REWARDS = [
  { day: 1, rewardType: 'VES', currency: 'VES', amount: 5, title: 'Daily Reward', subtitle: '5 VEs', assetType: 'coin' },
  { day: 2, rewardType: 'VES', currency: 'VES', amount: 10, title: 'Daily Reward', subtitle: '10 VEs', assetType: 'coin' },
  { day: 3, rewardType: 'VES', currency: 'VES', amount: 15, title: 'Daily Reward', subtitle: '15 VEs', assetType: 'coin' },
  { day: 4, rewardType: 'GIFT_CARD', currency: 'INR', amount: 1, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift' },
  { day: 5, rewardType: 'GIFT_CARD', currency: 'INR', amount: 2, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift-card' },
  { day: 6, rewardType: 'VES', currency: 'VES', amount: 30, title: 'Daily Reward', subtitle: '30 VEs', assetType: 'coin' },
  {
    day: 7,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 5,
    title: 'Ultimate Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'crown',
    isUltimate: true,
  },
];

async function seed() {
  await connectDB();

  for (const reward of REWARDS) {
    await StreakReward.findOneAndUpdate(
      { day: reward.day },
      { ...reward, active: true },
      { upsert: true, new: true }
    );
    console.log(`[seed] Day ${reward.day} -> ${reward.title} (${reward.subtitle})`);
  }

  console.log('[seed] Done.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
