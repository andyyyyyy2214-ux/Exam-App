const GradingService = require('../../src/services/gradingService');

describe('Auto-Grading Engine - Unit Test Suite', () => {
  const sampleExam = {
    id: 'exam-1',
    title: 'Computer Networks Midterm',
    passMarks: 5.0,
    negativeMarking: 0.25,
  };

  const sampleQuestions = [
    {
      id: 'q1',
      text: 'What is the default port for HTTP?',
      marks: 2.0,
      options: [
        { id: 'opt-1a', text: '80', isCorrect: true },
        { id: 'opt-1b', text: '443', isCorrect: false },
        { id: 'opt-1c', text: '21', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      text: 'Which protocol is connectionless?',
      marks: 2.0,
      options: [
        { id: 'opt-2a', text: 'TCP', isCorrect: false },
        { id: 'opt-2b', text: 'UDP', isCorrect: true },
      ],
    },
    {
      id: 'q3',
      text: 'IP address operates at which OSI layer?',
      marks: 2.0,
      options: [
        { id: 'opt-3a', text: 'Layer 2 - Data Link', isCorrect: false },
        { id: 'opt-3b', text: 'Layer 3 - Network', isCorrect: true },
        { id: 'opt-3c', text: 'Layer 4 - Transport', isCorrect: false },
      ],
    },
    {
      id: 'q4',
      text: 'Is IPv6 128-bit long?',
      marks: 1.0,
      options: [
        { id: 'opt-4a', text: 'True', isCorrect: true },
        { id: 'opt-4b', text: 'False', isCorrect: false },
      ],
    },
  ];

  test('TC-UNIT-01: Perfect score with 100% correct answers', () => {
    const submissions = [
      { questionId: 'q1', selectedOptionId: 'opt-1a' },
      { questionId: 'q2', selectedOptionId: 'opt-2b' },
      { questionId: 'q3', selectedOptionId: 'opt-3b' },
      { questionId: 'q4', selectedOptionId: 'opt-4a' },
    ];

    const result = GradingService.evaluateSubmission({
      exam: sampleExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.score).toBe(7.0);
    expect(result.totalPossibleMarks).toBe(7.0);
    expect(result.percentage).toBe(100.0);
    expect(result.passed).toBe(true);
    expect(result.summary.correctCount).toBe(4);
    expect(result.summary.incorrectCount).toBe(0);
    expect(result.summary.unattemptedCount).toBe(0);
  });

  test('TC-UNIT-02: Mixed attempt with negative marking deducted correctly', () => {
    // q1: correct (+2)
    // q2: incorrect (-0.25)
    // q3: unattempted (0)
    // q4: correct (+1)
    // Expected total: 2 - 0.25 + 0 + 1 = 2.75
    const submissions = [
      { questionId: 'q1', selectedOptionId: 'opt-1a' },
      { questionId: 'q2', selectedOptionId: 'opt-2a' }, // wrong
      { questionId: 'q4', selectedOptionId: 'opt-4a' },
    ];

    const result = GradingService.evaluateSubmission({
      exam: sampleExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.score).toBe(2.75);
    expect(result.summary.correctCount).toBe(2);
    expect(result.summary.incorrectCount).toBe(1);
    expect(result.summary.unattemptedCount).toBe(1);
    expect(result.passed).toBe(false); // pass mark is 5.0
  });

  test('TC-UNIT-03: All wrong answers with negative marking floors score at 0', () => {
    const submissions = [
      { questionId: 'q1', selectedOptionId: 'opt-1b' }, // -0.25
      { questionId: 'q2', selectedOptionId: 'opt-2a' }, // -0.25
      { questionId: 'q3', selectedOptionId: 'opt-3a' }, // -0.25
      { questionId: 'q4', selectedOptionId: 'opt-4b' }, // -0.25
    ];

    const result = GradingService.evaluateSubmission({
      exam: sampleExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.rawScore).toBe(-1.0);
    expect(result.score).toBe(0); // Never award negative final score to student
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });

  test('TC-UNIT-04: Unattempted questions do not incur negative penalties', () => {
    const submissions = []; // student submits blank sheet

    const result = GradingService.evaluateSubmission({
      exam: sampleExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.score).toBe(0);
    expect(result.rawScore).toBe(0);
    expect(result.summary.unattemptedCount).toBe(4);
    expect(result.summary.incorrectCount).toBe(0);
  });

  test('TC-UNIT-05: Exact pass marks boundary condition', () => {
    // q1 (+2) + q2 (+2) + q4 (+1) = 5.0 -> Exactly passes
    const submissions = [
      { questionId: 'q1', selectedOptionId: 'opt-1a' },
      { questionId: 'q2', selectedOptionId: 'opt-2b' },
      { questionId: 'q4', selectedOptionId: 'opt-4a' },
    ];

    const result = GradingService.evaluateSubmission({
      exam: sampleExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.score).toBe(5.0);
    expect(result.passed).toBe(true);
  });

  test('TC-UNIT-06: Exam with 0 negative marking does not penalize incorrect answers', () => {
    const noPenaltyExam = { ...sampleExam, negativeMarking: 0 };
    const submissions = [
      { questionId: 'q1', selectedOptionId: 'opt-1a' }, // +2
      { questionId: 'q2', selectedOptionId: 'opt-2a' }, // wrong, 0 penalty
    ];

    const result = GradingService.evaluateSubmission({
      exam: noPenaltyExam,
      questions: sampleQuestions,
      submittedAnswers: submissions,
    });

    expect(result.score).toBe(2.0);
    expect(result.summary.incorrectCount).toBe(1);
  });
});
