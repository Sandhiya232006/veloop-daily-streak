const mongoose = require('mongoose');
const StreakCycle = require('../models/StreakCycle');
const StreakClaim = require('../models/StreakClaim');
const AuditLog = require('../models/AuditLog');
const rewardService = require('./reward.service');
const walletService = require('./wallet.service');
const { CYCLE_LENGTH, CLAIM_INTERVAL_HOURS, MISS_GRACE_HOURS } = require('../config/streakConfig');

const HOUR_MS = 60 * 60 * 1000;

function log(userId, event, details = {}) {
  // Fire-and-forget audit logging; never blocks the main flow.
  AuditLog.create({ userId, event, details }).catch((err) => {
    console.error('[audit] failed to write log:', err.message);
  });
}

/**
 * Finds the user's active streak cycle, creating a fresh Day 1 cycle
 * if none exists yet (brand new user).
 */
async function getOrCreateActiveCycle(userId) {
  let cycle = await StreakCycle.findOne({ userId, status: 'ACTIVE' });

  if (!cycle) {
    const lastCycle = await StreakCycle.findOne({ userId }).sort({ cycleNumber: -1 });
    const cycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;

    cycle = await StreakCycle.create({
      userId,
      cycleNumber,
      status: 'ACTIVE',
      currentDay: 1,
      lastClaimedAt: null,
      nextClaimAt: null, // claimable immediately
    });
  }

  return cycle;
}

/**
 * Checks server time against the cycle's claim window. If the user has
 * missed their required claim window, the streak is reset server-side.
 * The frontend has no say in this decision.
 */
async function applyMissedDayCheckIfNeeded(cycle) {
  const now = new Date();

  if (!cycle.nextClaimAt) {
    // Nothing pending, no way to have missed anything yet.
    return cycle;
  }

  const missDeadline = new Date(cycle.nextClaimAt.getTime() + MISS_GRACE_HOURS * HOUR_MS);

  if (now > missDeadline) {
    // Missed window has fully passed. Reset the streak.
    cycle.status = 'RESET';
    await cycle.save();

    log(cycle.userId, 'STREAK_RESET', {
      previousCycleId: cycle._id,
      missedAtDay: cycle.currentDay,
      missDeadline,
    });

    const newCycle = await StreakCycle.create({
      userId: cycle.userId,
      cycleNumber: cycle.cycleNumber + 1,
      status: 'ACTIVE',
      currentDay: 1,
      lastClaimedAt: null,
      nextClaimAt: null,
    });

    return newCycle;
  }

  return cycle;
}

/**
 * Builds the full status payload the frontend renders from.
 * Every value here is computed server-side.
 */
async function getStreakStatus(userId) {
  let cycle = await getOrCreateActiveCycle(userId);
  cycle = await applyMissedDayCheckIfNeeded(cycle);

  const now = new Date();
  const rewards = await rewardService.getAllActiveRewards();
  const totalRewards = await rewardService.getTotalRewards();

  const claims = await StreakClaim.find({ cycleId: cycle._id }).lean();
  const claimedDays = new Set(claims.map((c) => c.day));

  const isAvailableNow = !cycle.nextClaimAt || now >= cycle.nextClaimAt;

  const rewardCards = rewards.map((reward) => {
    let status;

    if (claimedDays.has(reward.day)) {
      status = 'CLAIMED';
    } else if (reward.day < cycle.currentDay) {
      // Should not normally happen (would already be claimed), defensive fallback.
      status = 'MISSED';
    } else if (reward.day === cycle.currentDay) {
      status = isAvailableNow ? 'AVAILABLE' : 'LOCKED';
    } else {
      status = 'LOCKED';
    }

    return {
      day: reward.day,
      status,
      isToday: reward.day === cycle.currentDay,
      nextClaimAt:
        reward.day === cycle.currentDay && !isAvailableNow ? cycle.nextClaimAt : undefined,
      reward: {
        type: reward.rewardType,
        currency: reward.currency,
        amount: reward.amount,
        title: reward.title,
        subtitle: reward.subtitle,
        assetType: reward.assetType,
        isUltimate: reward.isUltimate,
      },
    };
  });

  const nextRewardConfig = rewards.find((r) => r.day === cycle.currentDay);

  return {
    success: true,
    serverTime: now.toISOString(),
    streak: {
      currentStreak: claimedDays.size, // days actually claimed in this cycle
      currentDay: cycle.currentDay,
      checkedIn: claimedDays.size,
      totalRewards,
      status: cycle.status,
      isAvailableNow,
      nextClaimAt: cycle.nextClaimAt,
      nextReward: nextRewardConfig
        ? {
            day: nextRewardConfig.day,
            amount: nextRewardConfig.amount,
            currency: nextRewardConfig.currency,
            type: nextRewardConfig.rewardType,
          }
        : null,
    },
    rewards: rewardCards,
  };
}

/**
 * The single most important function in the system.
 * Independently re-validates everything server-side regardless of what
 * the client sends. The only thing trusted from the request is the
 * authenticated userId (from JWT) — nothing else.
 */
async function claimReward(userId) {
  log(userId, 'STREAK_CLAIM_REQUEST', {});

  let cycle = await getOrCreateActiveCycle(userId);
  cycle = await applyMissedDayCheckIfNeeded(cycle);

  const now = new Date();
  const isAvailableNow = !cycle.nextClaimAt || now >= cycle.nextClaimAt;

  if (!isAvailableNow) {
    log(userId, 'STREAK_CLAIM_REJECTED', { reason: 'LOCKED', nextClaimAt: cycle.nextClaimAt });
    const err = new Error('Your next reward is not available yet.');
    err.code = 'LOCKED';
    throw err;
  }

  const day = cycle.currentDay; // derived entirely server-side, client "day" is ignored
  const rewardConfig = await rewardService.getRewardForDay(day);

  const session = await mongoose.startSession();

  try {
    let claimResult;

    await session.withTransaction(async () => {
      // Optimistic concurrency guard: only succeeds if the cycle is still
      // exactly where we think it is. If two requests race, only one of
      // them will match+update; the other gets null back.
      const updatedCycle = await StreakCycle.findOneAndUpdate(
        { _id: cycle._id, status: 'ACTIVE', currentDay: day },
        {
          $set: {
            currentDay: day + (day >= CYCLE_LENGTH ? 0 : 1),
            lastClaimedAt: now,
            nextClaimAt:
              day >= CYCLE_LENGTH
                ? null // cycle complete; could trigger a new cycle on next status check
                : new Date(now.getTime() + CLAIM_INTERVAL_HOURS * HOUR_MS),
            status: day >= CYCLE_LENGTH ? 'COMPLETED' : 'ACTIVE',
          },
        },
        { new: true, session }
      );

      if (!updatedCycle) {
        const err = new Error('This reward has already been claimed.');
        err.code = 'ALREADY_CLAIMED';
        throw err;
      }

      const { transaction } = await walletService.creditWallet({
        userId,
        currency: rewardConfig.currency,
        amount: rewardConfig.amount,
        streakDay: day,
        session,
      });

      // Unique index on (userId, cycleId, day) gives a second, DB-level
      // guarantee against duplicate/concurrent claims.
      const claimDocs = await StreakClaim.create(
        [
          {
            userId,
            cycleId: cycle._id,
            day,
            rewardId: rewardConfig._id,
            transactionId: transaction._id,
            claimedAt: now,
          },
        ],
        { session }
      );

      claimResult = {
        claim: claimDocs[0],
        transaction,
        cycle: updatedCycle,
      };
    });

    log(userId, 'STREAK_CLAIM_SUCCESS', { day, cycleId: cycle._id.toString() });

    return {
      success: true,
      day,
      reward: {
        type: rewardConfig.rewardType,
        currency: rewardConfig.currency,
        amount: rewardConfig.amount,
        title: rewardConfig.title,
      },
      transaction: {
        transactionId: claimResult.transaction.transactionId,
        referenceId: claimResult.transaction.referenceId,
        balanceBefore: claimResult.transaction.balanceBefore,
        balanceAfter: claimResult.transaction.balanceAfter,
      },
      streak: {
        currentDay: claimResult.cycle.currentDay,
        nextClaimAt: claimResult.cycle.nextClaimAt,
        status: claimResult.cycle.status,
      },
    };
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key from the unique index — idempotency safety net.
      log(userId, 'DUPLICATE_CLAIM', { day });
      const dupErr = new Error('This reward has already been claimed.');
      dupErr.code = 'ALREADY_CLAIMED';
      throw dupErr;
    }
    if (err.code === 'ALREADY_CLAIMED') {
      log(userId, 'DUPLICATE_CLAIM', { day });
    } else {
      log(userId, 'STREAK_CLAIM_REJECTED', { day, reason: err.message });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function getHistory(userId) {
  const claims = await StreakClaim.find({ userId })
    .sort({ claimedAt: -1 })
    .populate('rewardId', 'day rewardType currency amount title')
    .populate('transactionId', 'transactionId referenceId amount currency')
    .lean();

  return claims.map((c) => ({
    day: c.day,
    claimedAt: c.claimedAt,
    reward: c.rewardId,
    transaction: c.transactionId,
  }));
}

module.exports = {
  getStreakStatus,
  claimReward,
  getHistory,
  getOrCreateActiveCycle,
};
