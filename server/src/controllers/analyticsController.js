const prisma = require('../config/db');

// @route   GET /api/v1/analytics/exam/:examId
const getExamAnalytics = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: true,
        submissions: {
          where: { status: 'SUBMITTED' },
          include: {
            student: { select: { id: true, name: true, email: true } },
            cheatingLogs: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Role check: Only teacher who created exam or Admin
    if (req.user.role === 'TEACHER' && exam.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot view analytics for another teacher’s exam.',
      });
    }

    const totalSubmissions = exam.submissions.length;

    if (totalSubmissions === 0) {
      return res.status(200).json({
        success: true,
        data: {
          exam: { id: exam.id, title: exam.title, subject: exam.subject.name },
          metrics: {
            totalSubmissions: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            passRate: 0,
          },
          distribution: { excellent: 0, good: 0, average: 0, fail: 0 },
          studentResults: [],
        },
      });
    }

    const scores = exam.submissions.map((s) => s.score);
    const passedCount = exam.submissions.filter((s) => s.passed).length;
    const totalScoreSum = scores.reduce((sum, s) => sum + s, 0);

    const averageScore = Number((totalScoreSum / totalSubmissions).toFixed(2));
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = Number(((passedCount / totalSubmissions) * 100).toFixed(2));

    // Distribution bands based on percentage
    const distribution = {
      excellent: exam.submissions.filter((s) => s.percentage >= 80).length,
      good: exam.submissions.filter((s) => s.percentage >= 60 && s.percentage < 80).length,
      average: exam.submissions.filter((s) => s.percentage >= 40 && s.percentage < 60).length,
      fail: exam.submissions.filter((s) => s.percentage < 40).length,
    };

    const studentResults = exam.submissions.map((s) => ({
      submissionId: s.id,
      studentName: s.student.name,
      studentEmail: s.student.email,
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      passed: s.passed,
      infractions: s.cheatingLogs.length,
      submittedAt: s.submittedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        exam: {
          id: exam.id,
          title: exam.title,
          subject: exam.subject.name,
          durationMinutes: exam.durationMinutes,
          passMarks: exam.passMarks,
        },
        metrics: {
          totalSubmissions,
          averageScore,
          highestScore,
          lowestScore,
          passRate,
        },
        distribution,
        studentResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/analytics/student/history
const getStudentHistory = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'STUDENT' ? req.user.id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const submissions = await prisma.submission.findMany({
      where: { studentId, status: 'SUBMITTED' },
      include: {
        exam: {
          include: { subject: { select: { name: true, code: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalTaken = submissions.length;
    const passedCount = submissions.filter((s) => s.passed).length;
    const avgScore = totalTaken > 0
      ? Number((submissions.reduce((acc, s) => acc + s.percentage, 0) / totalTaken).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTaken,
          passedCount,
          failedCount: totalTaken - passedCount,
          averagePercentage: avgScore,
        },
        history: submissions.map((s) => ({
          submissionId: s.id,
          examTitle: s.exam.title,
          subject: s.exam.subject.name,
          score: s.score,
          totalMarks: s.totalMarks,
          percentage: s.percentage,
          passed: s.passed,
          submittedAt: s.submittedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExamAnalytics, getStudentHistory };
