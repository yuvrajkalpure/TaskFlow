const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Helper to parse User Agent
const getDeviceInfo = (ua) => {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  return `${browser} on ${os}`;
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_123456_task_tracker', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: true // By-pass OTP email verification
    });

    const token = generateToken(user._id);
    const ua = req.headers['user-agent'] || 'Unknown Device';
    const deviceInfo = getDeviceInfo(ua);
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    user.sessions.push({
      token,
      deviceInfo,
      ipAddress,
      lastActive: new Date()
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      theme: user.theme,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check deactivation status
    if (user.isDeleted) {
      return res.status(403).json({ message: 'Account deactivated. Please contact support.' });
    }

    if (await user.matchPassword(password)) {
      const token = generateToken(user._id);

      // Register session
      const ua = req.headers['user-agent'] || 'Unknown Device';
      const deviceInfo = getDeviceInfo(ua);
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

      user.sessions.push({
        token,
        deviceInfo,
        ipAddress,
        lastActive: new Date()
      });

      await user.save();

      // Send login notification mail
      const loginTime = new Date().toLocaleString();
      await sendEmail({
        to: user.email,
        subject: 'New Login Detected - TaskFlow',
        text: `Hello ${user.username},\nA new login was detected on your account.\nDevice: ${deviceInfo}\nIP Address: ${ipAddress}\nTime: ${loginTime}\nIf this was not you, please reset your password immediately.`,
        html: `<h3>New Login Detected</h3><p>Hello <strong>${user.username}</strong>,</p><p>We detected a new login to your TaskFlow account:</p><ul><li><strong>Device:</strong> ${deviceInfo}</li><li><strong>IP Address:</strong> ${ipAddress}</li><li><strong>Time:</strong> ${loginTime}</li></ul><p>If this was not you, please log in and change your password immediately.</p>`
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        theme: user.theme,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request forgot password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendEmail({
        to: user.email,
        subject: 'Reset Password Code - TaskFlow',
        text: `Your password reset code is: ${otp}. It will expire in 15 minutes.`,
        html: `<h3>Password Reset Requested</h3><p>You requested to reset your password. Use the following code:</p><h2>${otp}</h2><p>This code will expire in 15 minutes. If you did not make this request, please ignore this email.</p>`
      });
    }

    res.status(200).json({ message: 'If the email exists, a password reset code has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using OTP verification code
// @route   POST /api/auth/reset-password-otp
// @access  Public
const resetPasswordOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, verification code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    if (!user) {
      return res.status(400).json({ message: 'User not found or account is deactivated' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpires = null;
    user.sessions = [];

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user (removes active session)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.sessions = user.sessions.filter(s => s.token !== req.token);
      await user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordOTP,
  logoutUser
};
