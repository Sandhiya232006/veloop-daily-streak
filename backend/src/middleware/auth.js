const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authenticates the request using a Bearer JWT.
 * Attaches req.userId (trusted) — this is the ONLY source of user identity
 * used anywhere in the streak/claim logic. Request bodies are never trusted
 * for identity (see: Cross-User Attack, User ID Cheat Test in project spec).
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select('_id active');
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }

    req.userId = user._id;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }
}

module.exports = { requireAuth };
