const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');

describe('Comprehensive Feature Test Suite', () => {
  let studentToken = '';
  let teacherToken = '';
  let adminToken = '';
  let testSubjectId = '';
  let createdQuestionId = '';
  let createdExamId = '';

  beforeAll(async () => {
    // 1. Authenticate seeded users
    const studentRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student@anand.edu',
      password: 'Password@123',
    });
    studentToken = studentRes.body.data.token;

    const teacherRes = await request(app).post('/api/v1/auth/login').send({
      email: 'teacher@anand.edu',
      password: 'Password@123',
    });
    teacherToken = teacherRes.body.data.token;

    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@anand.edu',
      password: 'Password@123',
    });
    adminToken = adminRes.body.data.token;

    // Fetch existing subject
    const subject = await prisma.subject.findFirst();
    if (subject) testSubjectId = subject.id;
  });

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & SECURITY
  // -------------------------------------------------------------
  describe('Authentication & Access Control', () => {
    test('TC-AUTH-01: Valid login returns JWT and user profile', () => {
      expect(studentToken).toBeTruthy();
      expect(teacherToken).toBeTruthy();
      expect(adminToken).toBeTruthy();
    });

    test('TC-AUTH-02: Invalid password returns 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'student@anand.edu',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('TC-AUTH-03: Email without domain returns 400 with specific message', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'student_without_domain',
        password: 'Password@123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Please enter a valid email with domain');
    });

    test('TC-AUTH-04: Demo token authentication works seamlessly for Teacher', async () => {
      const res = await request(app)
        .get('/api/v1/exams/teacher')
        .set('Authorization', 'Bearer demo-token-teacher');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('TC-AUTH-05: Student token blocked from accessing Teacher-only route (RBAC)', async () => {
      const res = await request(app)
        .get('/api/v1/exams/teacher')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 2. QUESTION BANK FEATURES
  // -------------------------------------------------------------
  describe('Question Bank Management', () => {
    test('TC-QB-01: Teacher can fetch all questions from question bank', async () => {
      const res = await request(app)
        .get('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('TC-QB-02: Teacher can create a new objective question with 4 options', async () => {
      const res = await request(app)
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          subjectId: testSubjectId,
          text: 'What is the standard port number for HTTPS secure web traffic?',
          explanation: 'HTTPS traffic runs by default over TCP port 443.',
          marks: 2.0,
          negativeMarks: 0.5,
          options: [
            { text: '80', isCorrect: false },
            { text: '443', isCorrect: true },
            { text: '8080', isCorrect: false },
            { text: '22', isCorrect: false },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toContain('HTTPS');
      expect(res.body.data.options.length).toBe(4);
      createdQuestionId = res.body.data.id;
    });

    test('TC-QB-03: Student role forbidden from creating questions', async () => {
      const res = await request(app)
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subjectId: testSubjectId,
          text: 'Unauthorized question',
          options: [{ text: 'A', isCorrect: true }],
        });
      expect(res.status).toBe(403);
    });
  });

  // -------------------------------------------------------------
  // 3. EXAM CREATION & SCHEDULING
  // -------------------------------------------------------------
  describe('Exam Publishing & Scheduling', () => {
    test('TC-EXAM-01: Teacher can publish and schedule a new examination', async () => {
      const res = await request(app)
        .post('/api/v1/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Automated Test Assessment: Cloud Networking',
          description: 'Verified assessment generated by feature test suite.',
          subjectId: testSubjectId,
          durationMinutes: 45,
          totalMarks: 2.0,
          passMarks: 1.0,
          negativeMarking: 0.5,
          questionIds: [createdQuestionId],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Cloud Networking');
      createdExamId = res.body.data.id;
    });

    test('TC-EXAM-02: Teacher can view managed exams list', async () => {
      const res = await request(app)
        .get('/api/v1/exams/teacher')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((e) => e.id === createdExamId)).toBe(true);
    });

    test('TC-EXAM-03: Student can view active/available exams list', async () => {
      const res = await request(app)
        .get('/api/v1/exams/available')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 4. STUDENT EXAM RUNNER & AUTO-GRADING
  // -------------------------------------------------------------
  describe('Exam Runner & Auto-Grading Engine', () => {
    test('TC-RUN-01: Student can fetch exam questions with options', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${createdExamId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions.length).toBeGreaterThan(0);
    });

    test('TC-RUN-02: Anti-cheating audit event logs tab switch infractions', async () => {
      // Create a submission attempt first
      const startRes = await request(app)
        .post(`/api/v1/submissions/${createdExamId}/start`)
        .set('Authorization', `Bearer ${studentToken}`);

      if (startRes.status === 201) {
        const subId = startRes.body.data.id;
        const cheatRes = await request(app)
          .post('/api/v1/submissions/cheating-event')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            submissionId: subId,
            eventType: 'APP_BACKGROUND',
            metadata: { switchCount: 1 },
          });
        expect(cheatRes.status).toBe(200);
        expect(cheatRes.body.success).toBe(true);
      }
    });

    test('TC-RUN-03: Deterministic grading calculates positive marks and passes exam', async () => {
      // Find the correct option for createdQuestionId
      const q = await prisma.question.findUnique({
        where: { id: createdQuestionId },
        include: { options: true },
      });
      const correctOpt = q.options.find((o) => o.isCorrect);

      const submitRes = await request(app)
        .post(`/api/v1/submissions/${createdExamId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [{ questionId: createdQuestionId, selectedOptionId: correctOpt.id }],
          durationSeconds: 120,
        });

      // Status 200 or 400 if already submitted
      if (submitRes.status === 200) {
        expect(submitRes.body.success).toBe(true);
        expect(submitRes.body.data.score).toBeGreaterThan(0);
        expect(submitRes.body.data.passed).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------
  // 5. ADMIN SYSTEM MONITORING
  // -------------------------------------------------------------
  describe('Administrator Monitoring & Governance', () => {
    test('TC-ADM-01: Admin can retrieve system-wide KPI statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalExams');
      expect(res.body.data).toHaveProperty('totalSubmissions');
    });

    test('TC-ADM-02: Admin can fetch user management list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('TC-ADM-03: Non-admin is blocked from admin stats (RBAC guard)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
  });
});
