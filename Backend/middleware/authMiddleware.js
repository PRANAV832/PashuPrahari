const User = require('../models/User');

const parseToken = (token) => {
  if (!token) return null;
  try {
    if (token.startsWith('session-')) {
      const parts = token.split('-');
      // session-<userId>-<timestamp>
      if (parts.length >= 3) {
        return parts[1];
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const headerUserId = req.headers['x-user-id'] || null;
    const headerUserPhone = req.headers['x-user-phone'] || null;

    let user = null;

    // 1. Try resolving by userId from token
    const tokenUserId = parseToken(token);
    const targetUserId = headerUserId || tokenUserId;

    if (targetUserId) {
      try {
        user = await User.findById(targetUserId);
        if (!user) {
          user = await User.findOne({
            $or: [{ phone: targetUserId }, { employeeId: targetUserId }, { farmerRefId: targetUserId }]
          });
        }
      } catch (e) {
        // if invalid ObjectId, check by phone/employeeId
        user = await User.findOne({
          $or: [{ phone: targetUserId }, { employeeId: targetUserId }, { farmerRefId: targetUserId }]
        });
      }
    }

    // 2. Try resolving by phone header if not found
    if (!user && headerUserPhone) {
      user = await User.findOne({ phone: headerUserPhone.replace(/\D/g, '') });
    }

    // 3. Fallback check for query params if passed during testing
    if (!user && req.query.authUserId) {
      user = await User.findById(req.query.authUserId).catch(() => null);
    }

    req.user = user || null;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireAuth,
  requireRole
};
