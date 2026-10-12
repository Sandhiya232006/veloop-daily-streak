// DEV-ONLY helper to test timer + missed-day reset without waiting days.
// It edits the stored nextClaimAt in YOUR dev database. Never ship this to production.
//   node scripts/timeTravel.js <email> <hoursAgo>
//   hoursAgo = 1   -> the wait is over by 1h  => next day becomes AVAILABLE
//   hoursAgo = 60  -> missed (past the 24h grace) => streak RESETS to Day 1
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const StreakCycle = require('../src/models/StreakCycle');

(async () => {
  const [email, hoursAgoArg] = process.argv.slice(2);
  if (!email) {
    console.log('Usage: node scripts/timeTravel.js <email> <hoursAgo>');
    process.exit(1);
  }
  const hoursAgo = parseFloat(hoursAgoArg || '1');
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) { console.log('User not found'); process.exit(1); }
  const cycle = await StreakCycle.findOne({ userId: user._id, status: 'ACTIVE' });
  if (!cycle || !cycle.nextClaimAt) { console.log('No pending timer for this user (claim Day 1 first).'); process.exit(1); }
  cycle.nextClaimAt = new Date(Date.now() - hoursAgo * 3600 * 1000);
  await cycle.save();
  console.log(`nextClaimAt moved to ${cycle.nextClaimAt.toISOString()} (${hoursAgo}h ago). Now call GET /status.`);
  await mongoose.disconnect();
})();
