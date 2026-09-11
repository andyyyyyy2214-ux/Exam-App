const prisma = require('../config/db');
const GradingService = require('../services/gradingService');

// @route   POST /api/v1/submissions/start
const startExamAttempt = async (req, res, next) => {
  try {
    const { examId } = req.body;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: { examId, studentId: req.user.id },
      orderBy: { startedAt: 'desc' },
    });

    if (existingSubmission && existingSubmission.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this exam.',
        data: { submissionId: existingSubmission.id },
      });
    }

    // Return existing in-progress or create new
    if (existingSubmission && existingSubmission.status === 'IN_PROGRESS') {
      return res.status(200).json({
        success: true,
        message: 'Resuming in-progress exam attempt.',
        data: { submissionId: existingSubmission.id, startedAt: existingSubmission.startedAt },
      });
    }

    const newSubmission = await prisma.submission.create({
      data: {
        examId,
        studentId: req.user.id,
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Exam attempt started.',
      data: { submissionId: newSubmission.id, startedAt: newSubmission.startedAt },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/submissions/submit
const submitExam = async (req, res, next) => {
  try {
    const { submissionId, answers } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: { options: true }, // Include correct answer key for grading!
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission record not found.' });
    }

    // IDOR check: ensure the submission belongs to the requesting student
    if (submission.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot submit an exam for another student.',
      });
    }

    if (submission.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'This exam has already been submitted.',
        data: {
          score: submission.score,
          percentage: submission.percentage,
          passed: submission.passed,
        },
      });
    }

    const examQuestions = submission.exam.examQuestions.map((eq) => eq.question);

    // Call the deterministic Auto-Grading Engine
    const evaluation = GradingService.evaluateSubmission({
      exam: submission.exam,
      questions: examQuestions,
      submittedAnswers: answers,
    });

    // Execute atomic transaction to save answers and update submission
    const updatedSubmission = await prisma.$transaction(async (tx) => {
      // Save itemized answers
      await tx.submissionAnswer.createMany({
        data: evaluation.detailedAnswers.map((ans) => ({
          submissionId,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: ans.isCorrect,
          marksAwarded: ans.marksAwarded,
        })),
      });

      // Update submission status and final scores
      return tx.submission.update({
        where: { id: submissionId },
        data: {
          submittedAt: new Date(),
          score: evaluation.score,
          totalMarks: evaluation.totalPossibleMarks,
          percentage: evaluation.percentage,
          passed: evaluation.passed,
          status: 'SUBMITTED',
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Exam submitted and auto-graded successfully!',
      data: {
        submissionId: updatedSubmission.id,
        score: updatedSubmission.score,
        totalMarks: updatedSubmission.totalMarks,
        percentage: updatedSubmission.percentage,
        passed: updatedSubmission.passed,
        summary: evaluation.summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/submissions/:id/result
const getSubmissionResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        exam: {
          include: { subject: true },
        },
        student: { select: { id: true, name: true, email: true } },
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
        cheatingLogs: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Ownership check: Student can only view their own; Teacher or Admin can view any
    if (req.user.role === 'STUDENT' && submission.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not allowed to view other students’ results.',
      });
    }

    // Format itemized breakdown
    const breakdown = submission.answers.map((ans) => {
      const q = ans.question;
      const correctOpt = q.options.find((o) => o.isCorrect);
      const chosenOpt = q.options.find((o) => o.id === ans.selectedOptionId);

      return {
        questionId: q.id,
        questionText: q.text,
        explanation: q.explanation,
        selectedOption: chosenOpt ? chosenOpt.text : 'Unattempted',
        correctOption: correctOpt ? correctOpt.text : null,
        isCorrect: ans.isCorrect,
        marksAwarded: ans.marksAwarded,
        totalMarks: q.marks,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          student: submission.student,
          examTitle: submission.exam.title,
          subject: submission.exam.subject.name,
          score: submission.score,
          totalMarks: submission.totalMarks,
          percentage: submission.percentage,
          passed: submission.passed,
          startedAt: submission.startedAt,
          submittedAt: submission.submittedAt,
          infractionCount: submission.cheatingLogs.length,
        },
        breakdown,
        cheatingIncidents: submission.cheatingLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/submissions/cheating-event
const logCheatingEvent = async (req, res, next) => {
  try {
    const { submissionId, eventType, details } = req.body;

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const log = await prisma.cheatingLog.create({
      data: {
        submissionId,
        eventType,
        details: details || `Cheating event detected: ${eventType}`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Anti-cheating event logged.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startExamAttempt,
  submitExam,
  getSubmissionResult,
  logCheatingEvent,
};
