# SYSTEM DESIGN & ARCHITECTURE DOCUMENT

**Project**: Online Exam Application with Auto-Grading  
**Stack**: React Native (Expo), Node.js (v22), Express.js (v5), MySQL (8.0), Prisma ORM  
**Focus Areas**: Front-End Design (Prototype) | Business Logic Design | Database Design

---

## 1. FRONT-END DESIGN (PROTOTYPE)

### 1.1 Design Philosophy & User Experience (UX)
The mobile front-end is developed using **React Native (Expo)** following a mobile-first, distraction-free assessment paradigm. The interface prioritizes high readability, minimal cognitive load during test execution, and instant visual feedback upon exam completion. A single codebase natively supports Android, iOS, and Web preview through responsive layout primitives.

### 1.2 Navigation Architecture & Hierarchy
The front-end utilizes a role-segregated navigation hierarchy managed by React Navigation. Route mounting is strictly guarded by the user's authenticated role:

| Navigator Level | Access Guard | Component Screens | Functional Responsibilities |
| :--- | :--- | :--- | :--- |
| **Authentication Stack** | Public (Guest) | `LoginScreen`, `RegisterScreen` | JWT authentication, role assignment, password validation |
| **Student Navigator** | Role: `STUDENT` | Bottom Tabs: `Exams`, `History`, `Alerts`, `Help`<br>Nested: `ExamRunnerScreen`, `ResultScreen` | Timed exam attempt, question navigation, anti-cheating monitor, instant result card |
| **Teacher Navigator** | Role: `TEACHER` | Bottom Tabs: `Exams`, `Question Bank`, `Alerts`, `Help`<br>Nested: `CreateExamScreen`, `ExamAnalyticsScreen` | Question repository management, exam scheduling, class performance & infraction audit |
| **Admin Navigator** | Role: `ADMIN` | Bottom Tabs: `Dashboard`, `Alerts`, `Help` | System-wide KPI metrics, user account activation / deactivation |

### 1.3 Screen Prototype Layouts & Wireframe Descriptions
* **Login & Registration Prototype**: Dual input fields for credentials, error banner, submit button, and a dedicated *"Quick Fill for Evaluator Demo"* bar with 1-click presets for Student, Teacher, and Admin personas.
* **Student Dashboard Prototype**: Renders active and upcoming tests as cards. Displays subject badge, duration, question count, pass marks, and negative marking penalty tags. Toggles between *"Start Exam Now"* (if unattempted) and *"View Results"* (if already submitted).
* **Exam Runner (Timed Test Interface)**: Displays a fixed top bar with a live countdown timer (`Timer.js`) that turns crimson under 2 minutes. Features a central Question Card with prominent prompt text, single-choice option selectors (A, B, C, D), a Question Quick-Jump grid with color-coded answered/unanswered pills, and a modal confirmation submit button.
* **Instant Result Breakdown Prototype**: Immediate post-submission presentation featuring a dynamic Pass/Fail trophy banner, total score, percentage, attempted/correct/incorrect counters, integrity audit summary (0 violations vs. app-switch count), and an itemized question-by-question review displaying chosen answer, correct key, and detailed explanation.
* **Question Bank Management Prototype**: Categorized repository view displaying question prompts, points, difficulty chips, and correct option badges. Includes an *"Add Question"* modal with 4 option inputs and an active checkmark toggle to establish the answer key.
* **Create & Schedule Exam Prototype**: Assessment assembly screen enabling instructors to set title, description, duration in minutes, pass marks, negative marking rate, and pick questions from the bank using interactive checkbox cards.
* **Exam Analytics Dashboard Prototype**: Analytics suite showing 4 primary KPI cards (Total Submissions, Average Score, Pass Rate %, High/Low Scores), a 4-tier score distribution bar graph (80-100%, 60-79%, 40-59%, <40%), and a student submissions table highlighting cheating infraction counts in red.
* **Administrator Dashboard Prototype**: System health overview cards (Users, Exams, Submissions, Cheating Incidents) and a comprehensive user list with instant *"Activate / Deactivate"* status toggle buttons.

### 1.4 Mobile Anti-Cheating UI Flow
Integrated via the custom hook `useAntiCheating.js`, the mobile app actively listens for native `AppState` changes. If a student navigates away from the exam app (e.g. switching to a browser, answering a phone call, or minimizing the window), an urgent modal alert informs the user that an academic integrity violation has been recorded. Simultaneously, the event is transmitted to the backend API and appended to the student's submission audit trail.

---

## 2. BUSINESS LOGIC DESIGN

### 2.1 Layered Controller-Service Architecture
The backend REST API is architectured using a clean 3-tier pattern: **Route -> Controller -> Service -> Data**. Controllers handle HTTP serialization and request validation, while all critical grading, calculation, and security logic resides in isolated, testable service classes.

### 2.2 Core Deterministic Auto-Grading Engine (`GradingService`)
The auto-grading module is implemented as a pure, deterministic service. Upon student submission, the engine evaluates submitted answers against the instructor's verified answer keys stored in the database according to strict mathematical scoring rules:

1. **Overall Score Formula**:  
   $$\text{Total Score} = \sum \text{marksAwarded}$$
2. **Correct Answer Evaluation**:  
   If the student's `selectedOptionId` matches the `correctOptionId`:  
   $$\text{marksAwarded} = \text{question.marks}$$
3. **Negative Marking Rule**:  
   If `selectedOptionId` does not match `correctOptionId`, a negative penalty is applied:  
   $$\text{marksAwarded} = -\max(\text{exam.negativeMarking}, \text{question.negativeMarks})$$
4. **Unattempted Question Immunity**:  
   If `selectedOptionId` is null or unattempted, $\text{marksAwarded} = 0$. Unattempted questions never incur negative marking penalties.
5. **Floor Guard**:  
   To prevent students from receiving negative cumulative marks on an exam, the final score is floored at zero:  
   $$\text{Final Score} = \max(0, \text{Total Score})$$  
   Raw negative scores are retained separately for statistical analytics.
6. **Pass / Fail Determination**:  
   $$\text{Percentage} = \left(\frac{\text{Final Score}}{\text{Total Possible Marks}}\right) \times 100$$  
   $$\text{Passed} = (\text{Final Score} \ge \text{exam.passMarks})$$

### 2.3 Security, Authorization & Session Management Logic
* **Stateless Tokens**: Uses JSON Web Tokens (JWT) signed with a secure server secret.
* **Bcrypt Hashing**: Passwords are cryptographically hashed using salted Bcrypt (work factor: 10).
* **Role-Based Access Control (RBAC)**: Request middleware enforces strict access barriers (`ADMIN`, `TEACHER`, `STUDENT`).
* **Answer Key Protection**: The `/exams/:id/take` endpoint strictly strips `isCorrect` from the options payload before transmission.
* **Atomic Transactions**: All submission evaluations execute within a database transaction (`prisma.$transaction`), ensuring atomic updates across submission statuses and answer item creations.

### 2.4 Class Performance Analytics Computation
The analytics controller computes descriptive statistics across all completed submissions:
* Arithmetic Mean (Average Score)
* Highest and Lowest Scores
* Class Pass Rate percentage
* 4-tier score distribution bucketing: Excellent ($\ge 80\%$), Good ($60\text{--}79\%$), Average ($40\text{--}59\%$), and Fail ($<40\%$).

---

## 3. DATABASE DESIGN

### 3.1 DBMS Selection & Architectural Rationale
**MySQL 8.0** was chosen as the production relational database management system due to its strict ACID compliance, relational integrity enforcement, support for foreign key cascade constraints, and performance under concurrent read/write transactions. **Prisma ORM** serves as the type-safe abstraction layer, providing automated schema migrations, connection pooling, and parameterized query execution.

### 3.2 Entity-Relationship (ER) Architecture
The relational schema consists of 11 distinct entities modeling the complete examination lifecycle:

| Entity Name | Functional Purpose & Relational Scope |
| :--- | :--- |
| **User** | Core user entity storing name, unique email, hashed password, role (`ADMIN`, `TEACHER`, `STUDENT`), and active status. |
| **Subject** | Academic department classification (e.g. Computer Networks) with unique code. |
| **Question** | Objective question bank repository item with difficulty, marks, negative penalty, explanation, and subject reference. |
| **Option** | Multiple-choice alternatives linked to a question, containing option text and boolean answer key (`isCorrect`). |
| **Exam** | Scheduled assessment containing duration, pass marks, negative marking rate, and status (`SCHEDULED`, `COMPLETED`). |
| **ExamQuestion** | Join entity establishing an ordered relationship between exams and question bank items. |
| **Submission** | Student exam attempt tracking start time, submission time, score, percentage, pass/fail status, and completion state. |
| **SubmissionAnswer** | Itemized audit log recording the student's selected option, correctness, and marks awarded for each individual question. |
| **CheatingLog** | Integrity audit trail logging backgrounding events, focus loss, and timestamps during an active exam attempt. |
| **Notification** | System alerts sent to users regarding scheduled tests, upcoming deadlines, and declared examination results. |
| **SupportTicket** | Help desk inquiries and student support issues filed during registration or examination sessions. |

### 3.3 Comprehensive Data Dictionary

| Table | Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `id` | VARCHAR(36) | PK, UUID | Unique identifier for user account |
| **User** | `email` | VARCHAR(191) | UNIQUE, NOT NULL | Login email address |
| **User** | `password` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password string |
| **User** | `role` | VARCHAR(20) | DEFAULT 'STUDENT' | `'ADMIN'`, `'TEACHER'`, or `'STUDENT'` |
| **User** | `isActive` | BOOLEAN | DEFAULT TRUE | Account activation flag |
| **Question** | `id` | VARCHAR(36) | PK, UUID | Unique question bank identifier |
| **Question** | `subjectId` | VARCHAR(36) | FK -> Subject.id | Cascade delete on subject removal |
| **Question** | `text` | TEXT | NOT NULL | Question stem/prompt |
| **Question** | `marks` | FLOAT | DEFAULT 1.0 | Points awarded on correct answer |
| **Question** | `negativeMarks` | FLOAT | DEFAULT 0.0 | Penalty deducted on wrong answer |
| **Option** | `id` | VARCHAR(36) | PK, UUID | Unique option choice identifier |
| **Option** | `questionId` | VARCHAR(36) | FK -> Question.id | Cascade delete on question removal |
| **Option** | `text` | TEXT | NOT NULL | Option choice display text |
| **Option** | `isCorrect` | BOOLEAN | DEFAULT FALSE | Answer key indicator |
| **Exam** | `id` | VARCHAR(36) | PK, UUID | Unique exam session identifier |
| **Exam** | `durationMinutes`| INTEGER | DEFAULT 30 | Exam allotted countdown time |
| **Exam** | `passMarks` | FLOAT | DEFAULT 40.0 | Minimum points required to pass |
| **Exam** | `negativeMarking`| FLOAT | DEFAULT 0.0 | Exam-level negative marking rate |
| **Submission** | `id` | VARCHAR(36) | PK, UUID | Unique exam attempt record identifier |
| **Submission** | `examId` | VARCHAR(36) | FK -> Exam.id | Target exam reference |
| **Submission** | `studentId` | VARCHAR(36) | FK -> User.id | Candidate student reference |
| **Submission** | `score` | FLOAT | DEFAULT 0.0 | Auto-graded final score |
| **Submission** | `percentage` | FLOAT | DEFAULT 0.0 | Normalized percentage score |
| **Submission** | `passed` | BOOLEAN | DEFAULT FALSE | Pass / fail result outcome |
| **CheatingLog** | `id` | VARCHAR(36) | PK, UUID | Unique audit event identifier |
| **CheatingLog** | `submissionId` | VARCHAR(36) | FK -> Submission.id | Linked submission attempt |
| **CheatingLog** | `eventType` | VARCHAR(50) | NOT NULL | `'APP_BACKGROUND'`, `'TAB_SWITCH'` |
| **CheatingLog** | `timestamp` | DATETIME | DEFAULT NOW() | Exact infraction occurrence time |

### 3.4 Data Integrity Constraints & Indexing Strategy
* **Referential Integrity**: Enforces `ON DELETE CASCADE` across parent-child links (deleting a question cleans up options; deleting an exam cleans up questions links and submissions).
* **Indexing Optimization**: Database indexes are applied on foreign keys (`subjectId`, `teacherId`, `examId`, `studentId`) to optimize query throughput under concurrent exam submissions.
* **Transactional Atomicity**: Submissions update atomic state through Prisma transactions, eliminating race conditions or partial writes.
