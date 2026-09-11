const prisma = require('../config/db');

// @route   GET /api/v1/common/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/common/support
const createSupportTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        subject,
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will contact you shortly.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/common/faqs
const getFAQs = async (req, res) => {
  const faqs = [
    {
      q: 'How does the auto-grading engine calculate my score?',
      a: 'The server evaluates your submitted answers directly against the instructor answer key. Negative marks are deducted if configured for the exam.',
    },
    {
      q: 'What happens if my phone switches apps during an exam?',
      a: 'The mobile app listens for AppState changes. Minimizing the app or answering a call logs an infraction event to the server for academic integrity review.',
    },
    {
      q: 'What if the timer reaches 00:00 before I click Submit?',
      a: 'The test runner automatically submits your selected answers immediately upon timer expiration.',
    },
    {
      q: 'Can I re-take an exam after submitting?',
      a: 'Once an exam is submitted, it cannot be retaken unless re-scheduled or reset by your teacher.',
    },
  ];

  res.status(200).json({
    success: true,
    data: faqs,
  });
};

module.exports = { getNotifications, createSupportTicket, getFAQs };
