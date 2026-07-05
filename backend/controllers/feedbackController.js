const Feedback = require('../models/Feedback');

// @desc    Submit feedback/rating
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: 'Rating value is required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      username: req.user.username,
      email: req.user.email,
      rating,
      comment: comment || ''
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback submissions (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedbackList = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackList
};
