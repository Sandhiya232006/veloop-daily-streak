const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { getStatus, claim, getHistory, getWallet } = require('../controllers/streakController');

const router = express.Router();

// Claim endpoint gets a tighter limiter — legitimate users claim at most
// once per day; this just guards against rapid-fire abuse/scripted attacks.
const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

router.get('/', getStatus);
router.get('/status', getStatus);
router.post('/claim', claimLimiter, claim);
router.get('/history', getHistory);
router.get('/wallet', getWallet);

module.exports = router;
