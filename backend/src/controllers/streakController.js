const streakService = require('../services/streak.service');
const Wallet = require('../models/Wallet');

// Maps internal error codes to safe, user-facing messages.
// Raw Mongo/Axios/Cast errors are NEVER sent to the client.
const ERROR_MESSAGES = {
  LOCKED: 'Your next reward is not available yet.',
  ALREADY_CLAIMED: 'This reward has already been claimed.',
  DEFAULT: 'Unable to process your reward. Please try again.',
};

async function getStatus(req, res) {
  try {
    const status = await streakService.getStreakStatus(req.userId);
    return res.json(status);
  } catch (err) {
    console.error('[streak] status error:', err.message);
    return res.status(500).json({ success: false, message: ERROR_MESSAGES.DEFAULT });
  }
}

async function claim(req, res) {
  try {
    // NOTE: req.body.day (if sent) is intentionally ignored below.
    // The service derives the actual claimable day from server state.
    const result = await streakService.claimReward(req.userId);
    return res.json(result);
  } catch (err) {
    const message = ERROR_MESSAGES[err.code] || ERROR_MESSAGES.DEFAULT;
    const statusCode = err.code === 'LOCKED' || err.code === 'ALREADY_CLAIMED' ? 409 : 500;

    if (!ERROR_MESSAGES[err.code]) {
      console.error('[streak] claim error:', err.message);
    }

    return res.status(statusCode).json({ success: false, message, code: err.code || 'SERVER_ERROR' });
  }
}

async function getHistory(req, res) {
  try {
    const history = await streakService.getHistory(req.userId);
    return res.json({ success: true, history });
  } catch (err) {
    console.error('[streak] history error:', err.message);
    return res.status(500).json({ success: false, message: ERROR_MESSAGES.DEFAULT });
  }
}

async function getWallet(req, res) {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId }).lean();
    return res.json({
      success: true,
      balances: wallet && wallet.balances ? wallet.balances : {},
    });
  } catch (err) {
    console.error('[wallet] fetch error:', err.message);
    return res.status(500).json({ success: false, message: ERROR_MESSAGES.DEFAULT });
  }
}

module.exports = { getStatus, claim, getHistory, getWallet };
