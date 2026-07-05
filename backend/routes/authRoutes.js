const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordOTP,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordOTP);
router.post('/logout', protect, logoutUser);

module.exports = router;
