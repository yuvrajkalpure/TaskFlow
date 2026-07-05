const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// @desc    Update user profile photo
// @route   PUT /api/users/profile/photo
// @access  Private
const updateProfilePhoto = async (req, res) => {
  try {
    const { profilePhoto } = req.body;
    
    // We expect profilePhoto to be a Base64 Data URI string
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    res.json({
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user application theme
// @route   PUT /api/users/profile/theme
// @access  Private
const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (theme !== 'dark' && theme !== 'light') {
      return res.status(400).json({ message: 'Theme must be either dark or light' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.theme = theme;
    await user.save();

    res.json({
      message: 'Theme preference updated',
      theme: user.theme
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password (while logged in)
// @route   PUT /api/users/profile/reset-password
// @access  Private
const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide old password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Refetch user to match password (req.user has password excluded)
    const user = await User.findById(req.user._id);
    
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Log out other sessions for security (keep current token only)
    user.sessions = user.sessions.filter(s => s.token === req.token);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active device sessions
// @route   GET /api/users/profile/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedSessions = user.sessions.map(s => ({
      _id: s._id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      isCurrent: s.token === req.token
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke/logout a device session
// @route   DELETE /api/users/profile/sessions/:sessionId
// @access  Private
const revokeSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.sessions = user.sessions.filter(s => s._id.toString() !== req.params.sessionId);
    await user.save();

    res.json({ message: 'Device session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft-deactivate/delete own account
// @route   DELETE /api/users/profile/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set soft delete flag
    user.isDeleted = true;
    
    // Revoke all device tokens immediately
    user.sessions = [];
    
    await user.save();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/list
// @access  Private/Admin
const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('username email role isVerified isDeleted profilePhoto createdAt')
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(users.map(async (u) => {
      const stats = await Task.aggregate([
        { $match: { user: u._id } },
        { $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      let total = 0;
      let pending = 0;
      let inProgress = 0;
      let completed = 0;

      stats.forEach(s => {
        total += s.count;
        if (s._id === 'Pending') pending = s.count;
        else if (s._id === 'In Progress') inProgress = s.count;
        else if (s._id === 'Completed') completed = s.count;
      });

      return {
        ...u.toObject(),
        taskStats: { total, pending, inProgress, completed }
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin deactivates/reactivates a user
// @route   PUT /api/users/admin/deactivate/:userId
// @access  Private/Admin
const adminToggleUserDeactivation = async (req, res) => {
  try {
    const { isDeleted } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate an administrator' });
    }

    user.isDeleted = isDeleted;
    if (isDeleted) {
      // Clear sessions to force logout
      user.sessions = [];
    }
    
    await user.save();

    res.json({
      message: `User deactivation state changed to ${isDeleted}`,
      user: {
        _id: user._id,
        username: user.username,
        isDeleted: user.isDeleted
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfilePhoto,
  updateTheme,
  resetPassword,
  getSessions,
  revokeSession,
  deactivateAccount,
  adminGetUsers,
  adminToggleUserDeactivation
};
