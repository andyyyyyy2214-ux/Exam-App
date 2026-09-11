# Test Plan & Test Case Matrix

**Project**: Online Exam Application with Auto-Grading  
**Scope**: Unit Testing, Integration Testing, Black-Box Functional Testing, Security & Boundary Testing

---

## 1. Unit Test Suite (Automated via Jest)

Executed via: `npm run test:unit`

| Test ID | Component / Module | Test Description | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-UNIT-01** | Auto-Grading Engine | Perfect score calculation | 4/4 questions answered correctly | Score: 7.0 / 7.0, Percentage: 100%, Passed: true | **PASSED** |
| **TC-UNIT-02** | Auto-Grading Engine | Negative marking deduction | 2 correct (+3.0), 1 wrong (-0.25), 1 unattempted (0) | Score: 2.75, Passed: false | **PASSED** |
| **TC-UNIT-03** | Auto-Grading Engine | Score floored at zero | All wrong answers with negative penalties | Raw score: -1.0, Final Score: 0.0, Passed: false | **PASSED** |
| **TC-UNIT-04** | Auto-Grading Engine | Unattempted penalty immunity | Blank submission array `[]` | Score: 0.0, Negative penalties: 0, Unattempted: 4 | **PASSED** |
| **TC-UNIT-05** | Auto-Grading Engine | Exact pass mark boundary | Score equals pass marks (5.0 == 5.0) | Passed: true | **PASSED** |
| **TC-UNIT-06** | Auto-Grading Engine | Zero negative marking exam | Negative marking set to 0.0 | Incorrect answers penalized 0 marks | **PASSED** |

---

## 2. API Integration Test Suite (Automated via Supertest)

Executed via: `npm run test:integration`

| Test ID | Route / Endpoint | Verification Goal | Precondition / Payload | Expected HTTP Status | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-INT-01** | `GET /health` | Liveness health check | None | 200 OK (`status: 'UP'`) | **PASSED** |
| **TC-INT-02** | `GET /api/v1/common/faqs` | Public guidance endpoint | None | 200 OK (Array of FAQs) | **PASSED** |
| **TC-INT-03** | `GET /api/v1/exams/available` | Protected route JWT guard | Missing `Authorization` header | 401 Unauthorized | **PASSED** |
| **TC-INT-04** | `POST /api/v1/auth/register` | Request input validation | Malformed email string | 400 Bad Request (Zod Error) | **PASSED** |
| **TC-INT-05** | `GET /api/v1/unknown-route` | Centralized 404 handler | Invalid URL path | 404 Route Not Found JSON | **PASSED** |

---

## 3. Black-Box Functional Test Cases (Manual End-to-End)

| Test ID | User Role | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BB-01** | Student | Account Registration & Login | 1. Navigate to Register.<br>2. Fill name, email, password, select Student.<br>3. Submit. | Account created, JWT stored in AsyncStorage, redirected to Student Dashboard. | **PASSED** |
| **TC-BB-02** | Student | Take Scheduled Exam | 1. Select Available Exam.<br>2. Click 'Start Exam'.<br>3. Answer questions via radio buttons.<br>4. Click 'Submit'. | Timer counts down; question navigator reflects answered state; instant result card displays score. | **PASSED** |
| **TC-BB-03** | Student | Anti-Cheating Detection | 1. During active exam, minimize app or switch to home screen.<br>2. Return to app. | In-app warning modal alerts user; infraction event logged to backend database. | **PASSED** |
| **TC-BB-04** | Teacher | Create Question with Key | 1. Open Question Bank.<br>2. Enter prompt & 4 options.<br>3. Tap checkmark to select correct key.<br>4. Save. | Question saved to database with correct answer flag; listed in repository. | **PASSED** |
| **TC-BB-05** | Teacher | Schedule Exam & Review Analytics | 1. Create exam attaching questions.<br>2. View submissions after student completes test. | Analytics screen shows Average Score, Pass Rate %, Score Distribution, and Infractions count. | **PASSED** |
| **TC-BB-06** | Admin | User Account Toggle | 1. Open Admin Dashboard.<br>2. Toggle student status to Deactivated.<br>3. Student attempts login. | Status changes to Deactivated; student login is blocked with 403 Forbidden. | **PASSED** |
| **TC-BB-07** | Student | Duplicate Submission Block | 1. Attempt to take an exam already submitted. | App displays 'Already Submitted' and loads previous result breakdown. | **PASSED** |
