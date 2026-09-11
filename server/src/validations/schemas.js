const { z } = require('zod');

// Authentication Schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email with domain (e.g. student@anand.edu)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z
      .string()
      .optional()
      .transform((val) => (val ? val.toUpperCase() : 'STUDENT')),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email with domain (e.g. student@anand.edu)'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Subject Schema
const subjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Subject name is required'),
    code: z.string().min(2, 'Subject code is required').toUpperCase(),
    description: z.string().optional(),
  }),
});

// Question Schema
const questionSchema = z.object({
  body: z.object({
    subjectId: z.string().min(1, 'Subject ID is required'),
    text: z.string().min(3, 'Question text is required'),
    explanation: z.string().optional(),
    type: z.enum(['MCQ', 'TRUE_FALSE']).default('MCQ'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    marks: z.number().positive().default(1.0),
    negativeMarks: z.number().min(0).default(0.0),
    options: z
      .array(
        z.object({
          text: z.string().min(1, 'Option text cannot be empty'),
          isCorrect: z.boolean().default(false),
        })
      )
      .min(2, 'A question must have at least 2 options')
      .refine(
        (opts) => opts.some((o) => o.isCorrect),
        'At least one option must be marked as correct'
      ),
  }),
});

// Exam Schema
const examSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Exam title must be at least 3 characters'),
    description: z.string().optional(),
    subjectId: z.string().min(1, 'Subject ID is required'),
    durationMinutes: z.number().int().positive('Duration must be positive in minutes'),
    totalMarks: z.number().positive('Total marks must be positive').default(100.0),
    passMarks: z.number().positive('Pass marks must be positive').default(40.0),
    negativeMarking: z.number().min(0).default(0.0),
    questionIds: z.array(z.string()).min(1, 'Exam must contain at least one question'),
    scheduledAt: z.string().optional(),
  }),
});

// Submission Schemas
const submitExamSchema = z.object({
  body: z.object({
    submissionId: z.string().min(1, 'Submission ID is required'),
    answers: z.array(
      z.object({
        questionId: z.string().min(1, 'Question ID is required'),
        selectedOptionId: z.string().nullable().optional(),
      })
    ),
  }),
});

const cheatingEventSchema = z.object({
  body: z.object({
    submissionId: z.string().min(1, 'Submission ID is required'),
    eventType: z.enum(['APP_BACKGROUND', 'TAB_SWITCH', 'FOCUS_LOST', 'SCREENSHOT_ATTEMPT']),
    details: z.string().optional(),
  }),
});

// Support Ticket Schema
const supportTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  subjectSchema,
  questionSchema,
  examSchema,
  submitExamSchema,
  cheatingEventSchema,
  supportTicketSchema,
};
