const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackList } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', submitFeedback);
router.get('/', admin, getFeedbackList);

module.exports = router;
