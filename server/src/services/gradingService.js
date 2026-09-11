/**
 * Core Auto-Grading Engine
 * Pure, deterministic evaluation logic for objective assessments.
 */

class GradingService {
  /**
   * Evaluate a student's submission against the question answer key.
   * 
   * @param {Object} params
   * @param {Object} params.exam - The exam configuration (totalMarks, passMarks, negativeMarking)
   * @param {Array}  params.questions - List of exam questions with their options
   * @param {Array}  params.submittedAnswers - List of { questionId, selectedOptionId }
   * @returns {Object} Evaluation summary with score, percentage, passed, and itemized breakdown
   */
  static evaluateSubmission({ exam, questions, submittedAnswers = [] }) {
    if (!exam || !questions || !Array.isArray(questions)) {
      throw new Error('Invalid arguments: exam and questions array are required.');
    }

    const answerMap = new Map();
    submittedAnswers.forEach((ans) => {
      if (ans && ans.questionId) {
        answerMap.set(ans.questionId, ans.selectedOptionId);
      }
    });

    let totalScore = 0;
    let totalPossibleMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const detailedAnswers = [];

    for (const question of questions) {
      const qMarks = Number(question.marks) || 1.0;
      totalPossibleMarks += qMarks;

      // Find the correct option for this question
      const correctOption = question.options?.find((opt) => opt.isCorrect);
      const selectedOptionId = answerMap.get(question.id);

      if (!selectedOptionId) {
        // Question was not attempted
        unattemptedCount += 1;
        detailedAnswers.push({
          questionId: question.id,
          selectedOptionId: null,
          correctOptionId: correctOption?.id || null,
          isCorrect: false,
          marksAwarded: 0,
          status: 'UNATTEMPTED',
        });
        continue;
      }

      // Check if selected option is the correct one
      const isCorrect = correctOption ? correctOption.id === selectedOptionId : false;

      let marksAwarded = 0;
      if (isCorrect) {
        correctCount += 1;
        marksAwarded = qMarks;
        totalScore += marksAwarded;
      } else {
        incorrectCount += 1;
        // Negative marking from exam level or question level
        const penalty = Number(exam.negativeMarking) > 0 
          ? Number(exam.negativeMarking) 
          : Number(question.negativeMarks) || 0;
        marksAwarded = -Math.abs(penalty);
        totalScore += marksAwarded;
      }

      detailedAnswers.push({
        questionId: question.id,
        selectedOptionId,
        correctOptionId: correctOption?.id || null,
        isCorrect,
        marksAwarded: Number(marksAwarded.toFixed(2)),
        status: isCorrect ? 'CORRECT' : 'INCORRECT',
      });
    }

    // Normalized scores (round to 2 decimal places)
    const finalScore = Number(Math.max(0, totalScore).toFixed(2));
    const rawScore = Number(totalScore.toFixed(2));
    const percentage = totalPossibleMarks > 0 
      ? Number(((finalScore / totalPossibleMarks) * 100).toFixed(2)) 
      : 0;
    const passed = finalScore >= (Number(exam.passMarks) || 0);

    return {
      score: finalScore,
      rawScore,
      totalPossibleMarks: Number(totalPossibleMarks.toFixed(2)),
      percentage,
      passed,
      summary: {
        totalQuestions: questions.length,
        attemptedCount: correctCount + incorrectCount,
        correctCount,
        incorrectCount,
        unattemptedCount,
      },
      detailedAnswers,
    };
  }
}

module.exports = GradingService;
