const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { subjectSchema } = require('../validations/schemas');

router.get('/', protect, subjectController.getAllSubjects);
router.post(
  '/',
  protect,
  authorize('ADMIN', 'TEACHER'),
  validate(subjectSchema),
  subjectController.createSubject
);

module.exports = router;
