const prisma = require('../config/db');

// @route   POST /api/v1/questions (Teacher & Admin)
const createQuestion = async (req, res, next) => {
  try {
    const { subjectId, text, explanation, type, difficulty, marks, negativeMarks, options } = req.body;

    let targetSubjectId = subjectId;
    const existingSubject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!existingSubject) {
      const defaultSub = await prisma.subject.findFirst();
      if (defaultSub) targetSubjectId = defaultSub.id;
    }

    const question = await prisma.question.create({
      data: {
        subjectId: targetSubjectId,
        teacherId: req.user.id,
        text,
        explanation,
        type: type || 'MCQ',
        difficulty: difficulty || 'MEDIUM',
        marks: marks || 1.0,
        negativeMarks: negativeMarks || 0.0,
        options: {
          create: options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: {
        options: true,
        subject: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully in question bank.',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/questions (Question Bank)
const getQuestions = async (req, res, next) => {
  try {
    const { subjectId, difficulty, type } = req.query;

    const where = {};
    if (subjectId) where.subjectId = subjectId;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;

    // If student, only their accessible questions or hide answers
    const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        options: {
          select: {
            id: true,
            text: true,
            // Only expose isCorrect to Teacher or Admin
            isCorrect: isTeacherOrAdmin,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/v1/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Ownership check (IDOR protection)
    if (req.user.role !== 'ADMIN' && question.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot delete a question created by another teacher.',
      });
    }

    await prisma.question.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuestion, getQuestions, deleteQuestion };
