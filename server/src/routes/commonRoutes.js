const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { supportTicketSchema } = require('../validations/schemas');

router.get('/notifications', protect, commonController.getNotifications);
router.post('/support', protect, validate(supportTicketSchema), commonController.createSupportTicket);
router.get('/faqs', commonController.getFAQs);

module.exports = router;
