# REST API Specification

Base URL: `http://localhost:5000/api/v1`  
Protocol: `REST over HTTP/1.1`  
Data Format: `application/json`

---

## 1. Authentication Endpoints

### Register Account
* **Method**: `POST`
* **Path**: `/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Rahul Verma",
    "email": "student@anand.edu",
    "password": "Password@123",
    "role": "STUDENT" // "STUDENT" | "TEACHER" | "ADMIN"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": { "id": "uuid", "name": "Rahul Verma", "email": "student@anand.edu", "role": "STUDENT" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### User Login
* **Method**: `POST`
* **Path**: `/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "student@anand.edu",
    "password": "Password@123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": { "id": "uuid", "name": "Rahul Verma", "email": "student@anand.edu", "role": "STUDENT" },
      "token": "jwt_token_string"
    }
  }
  ```

---

## 2. Examination Endpoints

### Create & Schedule Exam
* **Method**: `POST`
* **Path**: `/exams`
* **Access**: Private (`TEACHER`, `ADMIN`)
* **Request Body**:
  ```json
  {
    "title": "Computer Networks Midterm",
    "description": "Objective exam covering OSI model and IP protocols",
    "subjectId": "subject-uuid",
    "durationMinutes": 30,
    "totalMarks": 10.0,
    "passMarks": 5.0,
    "negativeMarking": 0.25,
    "questionIds": ["q-uuid-1", "q-uuid-2"]
  }
  ```
* **Success Response (201 Created)**: Returns created exam object with linked question count.

### Get Available Exams (Student View)
* **Method**: `GET`
* **Path**: `/exams/available`
* **Access**: Private (`STUDENT`)
* **Success Response (200 OK)**: Returns list of scheduled exams, duration, pass criteria, and whether the student has already attempted it.

### Get Exam for Taking (Runner View)
* **Method**: `GET`
* **Path**: `/exams/:id/take`
* **Access**: Private (`STUDENT`)
* **Security Note**: Options payload strictly strips out `isCorrect` to protect academic integrity against client inspection.

---

## 3. Submission & Auto-Grading Endpoints

### Start Exam Attempt
* **Method**: `POST`
* **Path**: `/submissions/start`
* **Access**: Private (`STUDENT`)
* **Request Body**: `{ "examId": "uuid" }`
* **Success Response (201 Created / 200 OK)**: Returns `{ submissionId, startedAt }`.

### Submit Assessment (Triggers Auto-Grading)
* **Method**: `POST`
* **Path**: `/submissions/submit`
* **Access**: Private (`STUDENT`)
* **Request Body**:
  ```json
  {
    "submissionId": "sub-uuid",
    "answers": [
      { "questionId": "q1-uuid", "selectedOptionId": "opt-uuid-a" },
      { "questionId": "q2-uuid", "selectedOptionId": null }
    ]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Exam submitted and auto-graded successfully!",
    "data": {
      "submissionId": "sub-uuid",
      "score": 7.5,
      "totalMarks": 10.0,
      "percentage": 75.0,
      "passed": true,
      "summary": {
        "totalQuestions": 4,
        "attemptedCount": 3,
        "correctCount": 3,
        "incorrectCount": 0,
        "unattemptedCount": 1
      }
    }
  }
  ```

### Get Submission Result Breakdown
* **Method**: `GET`
* **Path**: `/submissions/:id/result`
* **Access**: Private (Owner `STUDENT`, `TEACHER`, `ADMIN`)
* **Success Response (200 OK)**: Detailed question-by-question breakdown with chosen option, correct key, explanation, and cheating incidents log.

### Log Anti-Cheating Event
* **Method**: `POST`
* **Path**: `/submissions/cheating-event`
* **Access**: Private (`STUDENT`)
* **Request Body**:
  ```json
  {
    "submissionId": "sub-uuid",
    "eventType": "APP_BACKGROUND",
    "details": "User navigated away from app during active timer"
  }
  ```

---

## 4. Analytics Endpoints

### Get Exam Class Analytics
* **Method**: `GET`
* **Path**: `/analytics/exam/:examId`
* **Access**: Private (`TEACHER`, `ADMIN`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalSubmissions": 25,
        "averageScore": 74.2,
        "highestScore": 98.0,
        "lowestScore": 32.0,
        "passRate": 84.0
      },
      "distribution": { "excellent": 8, "good": 10, "average": 3, "fail": 4 },
      "studentResults": [...]
    }
  }
  ```

---

## 5. Admin & Common Endpoints

* `GET /admin/stats`: System KPIs (Total users, exams, submissions, cheating flags).
* `GET /admin/users`: User directory with status filter.
* `PATCH /admin/users/:id/status`: Activate or deactivate user account.
* `GET /common/notifications`: User notifications list.
* `POST /common/support`: Submit support ticket.
* `GET /common/faqs`: Exam guidelines & frequently asked questions.
* `GET /health`: Liveness & uptime health check.
