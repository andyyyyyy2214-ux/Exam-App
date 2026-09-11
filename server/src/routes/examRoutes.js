const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { examSchema } = require('../validations/schemas');

router.post(
  '/',
  protect,
  authorize('ADMIN', 'TEACHER'),
  validate(examSchema),
  examController.createExam
);
router.get('/teacher', protect, authorize('ADMIN', 'TEACHER'), examController.getTeacherExams);
router.get('/available', protect, examController.getAvailableExams);
router.get('/:id', protect, examController.getExamForTaking);
router.get('/:id/take', protect, examController.getExamForTaking);

module.exports = router;
