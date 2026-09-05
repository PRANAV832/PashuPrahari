const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, getCurrentUser } = require('../controllers/authController');

// POST /api/auth/request-otp - Send OTP to 10-digit Indian phone number
router.post('/request-otp', requestOtp);

// POST /api/auth/verify-otp - Verify 6-digit OTP code and initialize role session
router.post('/verify-otp', verifyOtp);

// GET /api/auth/me - Retrieve status/current user context
router.get('/me', getCurrentUser);

module.exports = router;
