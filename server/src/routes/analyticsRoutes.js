const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get(
  '/exam/:examId',
  protect,
  authorize('ADMIN', 'TEACHER'),
  analyticsController.getExamAnalytics
);
router.get('/student/history', protect, analyticsController.getStudentHistory);

module.exports = router;
