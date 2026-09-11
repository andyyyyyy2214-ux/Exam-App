const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { questionSchema } = require('../validations/schemas');

router.get('/', protect, questionController.getQuestions);
router.post(
  '/',
  protect,
  authorize('ADMIN', 'TEACHER'),
  validate(questionSchema),
  questionController.createQuestion
);
router.delete('/:id', protect, authorize('ADMIN', 'TEACHER'), questionController.deleteQuestion);

module.exports = router;
