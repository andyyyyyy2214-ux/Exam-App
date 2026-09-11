const prisma = require('../config/db');

// @route   POST /api/v1/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const subject = await prisma.subject.create({
      data: { name, code: code.toUpperCase(), description },
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/subjects
const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { exams: true, questions: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubject, getAllSubjects };
