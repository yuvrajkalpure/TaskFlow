const express = require('express');
const router = express.Router();
const {
  updateProfilePhoto,
  updateTheme,
  resetPassword,
  getSessions,
  revokeSession,
  deactivateAccount,
  adminGetUsers,
  adminToggleUserDeactivation
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are private
router.use(protect);

router.put('/profile/photo', updateProfilePhoto);
router.put('/profile/theme', updateTheme);
router.put('/profile/reset-password', resetPassword);
router.get('/profile/sessions', getSessions);
router.delete('/profile/sessions/:sessionId', revokeSession);
router.delete('/profile/deactivate', deactivateAccount);

// Admin-only routes
router.get('/admin/list', admin, adminGetUsers);
router.put('/admin/deactivate/:userId', admin, adminToggleUserDeactivation);

module.exports = router;
