const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { submitExamSchema, cheatingEventSchema } = require('../validations/schemas');

router.post('/start', protect, submissionController.startExamAttempt);
router.post('/submit', protect, validate(submitExamSchema), submissionController.submitExam);
router.get('/:id/result', protect, submissionController.getSubmissionResult);
router.post(
  '/cheating-event',
  protect,
  validate(cheatingEventSchema),
  submissionController.logCheatingEvent
);

module.exports = router;
