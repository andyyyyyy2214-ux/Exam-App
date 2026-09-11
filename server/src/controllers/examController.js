const prisma = require('../config/db');

// @route   POST /api/v1/exams (Teacher & Admin)
const createExam = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subjectId,
      durationMinutes,
      totalMarks,
      passMarks,
      negativeMarking,
      questionIds,
      scheduledAt,
    } = req.body;

    // Resolve subject
    let targetSubjectId = subjectId;
    const existingSubject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!existingSubject) {
      const defaultSub = await prisma.subject.findFirst();
      if (defaultSub) targetSubjectId = defaultSub.id;
    }

    // Resolve questions
    let validQuestionIds = [];
    const existingQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    if (existingQuestions.length > 0) {
      validQuestionIds = existingQuestions.map((q) => q.id);
    } else {
      // Fallback to any existing questions in DB
      const dbQuestions = await prisma.question.findMany({ take: questionIds.length || 4 });
      validQuestionIds = dbQuestions.map((q) => q.id);
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        subjectId: targetSubjectId,
        teacherId: req.user.id,
        durationMinutes,
        totalMarks: Number(totalMarks) || 100.0,
        passMarks: Number(passMarks) || 40.0,
        negativeMarking: Number(negativeMarking) || 0.0,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: 'SCHEDULED',
        examQuestions: {
          create: validQuestionIds.map((qId, index) => ({
            questionId: qId,
            orderIndex: index,
          })),
        },
      },
      include: {
        subject: true,
        examQuestions: {
          include: { question: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Exam created and scheduled successfully.',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/exams/teacher
const getTeacherExams = async (req, res, next) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subject: { select: { id: true, name: true, code: true } },
        _count: {
          select: { examQuestions: true, submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/exams/available (For Students)
const getAvailableExams = async (req, res, next) => {
  try {
    const exams = await prisma.exam.findMany({
      where: {
        status: { in: ['SCHEDULED', 'ONGOING'] },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true } },
        _count: { select: { examQuestions: true } },
        submissions: {
          where: { studentId: req.user.id },
          select: { id: true, status: true, score: true, percentage: true, passed: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = exams.map((exam) => {
      const studentSubmission = exam.submissions[0] || null;
      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        teacher: exam.teacher,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
        negativeMarking: exam.negativeMarking,
        totalQuestions: exam._count.examQuestions,
        hasAttempted: !!studentSubmission,
        submission: studentSubmission,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/exams/:id/take (For Student Exam Runner)
const getExamForTaking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        examQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            question: {
              include: {
                options: {
                  select: { id: true, text: true }, // NEVER expose isCorrect to student!
                },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Check if student has already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: { examId: id, studentId: req.user.id, status: 'SUBMITTED' },
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this exam.',
        data: { submissionId: existingSubmission.id },
      });
    }

    // Transform into clean question list
    const questions = exam.examQuestions.map((eq, index) => ({
      id: eq.question.id,
      number: index + 1,
      text: eq.question.text,
      type: eq.question.type,
      marks: eq.question.marks,
      negativeMarks: exam.negativeMarking > 0 ? exam.negativeMarking : eq.question.negativeMarks,
      options: eq.question.options,
    }));

    res.status(200).json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          subject: exam.subject,
          durationMinutes: exam.durationMinutes,
          totalMarks: exam.totalMarks,
          passMarks: exam.passMarks,
          negativeMarking: exam.negativeMarking,
          totalQuestions: questions.length,
        },
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getTeacherExams,
  getAvailableExams,
  getExamForTaking,
};
