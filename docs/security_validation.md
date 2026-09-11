# Security Validation & Integrity Audit

**Project**: Online Exam Application with Auto-Grading  
**Framework**: Node.js / Express 5 & React Native (Expo)

---

## 1. Threat Modeling & OWASP Mitigations

| Threat / Vulnerability | Risk Impact | Architectural Mitigation Applied | Verification Status |
| :--- | :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Database compromise, data leakage | **Prisma ORM**: All database queries utilize parameterized prepared statements under the hood. Raw string concatenation is strictly avoided. | **VERIFIED / IMMUNE** |
| **Insecure Direct Object Reference (IDOR)** | Student accesses another student's exam submission or modifies records | **Ownership Verification**: All `/submissions` routes check `submission.studentId === req.user.id`. Teachers can only view exams belonging to their account. | **VERIFIED / PROTECTED** |
| **Client-Side Answer Key Snooping** | Student inspects network payload or React state to read answers | **Server-Side Answer Key Stripping**: The `/exams/:id/take` endpoint explicitly removes `isCorrect` from the options payload before transmission. Answers are graded solely on the server. | **VERIFIED / SECURED** |
| **Credential & Secret Exposure** | Hardcoded secrets committed to version control | **Environment Isolation**: JWT secrets and database credentials reside exclusively in `.env` (ignored via `.gitignore`). `.env.example` provides non-sensitive template. | **VERIFIED / ZERO LEAKS** |
| **Information Disclosure via Stack Traces** | Raw database errors exposed to users | **Standardized Error Handler**: Production responses return sanitized `{ success: false, message }` JSON. Internal stack traces are suppressed. | **VERIFIED / SANITIZED** |
| **Weak Authentication & Password Storage** | Password cracking via rainbow tables | **Bcrypt Hashing**: Passwords undergo salted hashing with a cost factor of 10 prior to database insertion. | **VERIFIED / SECURE** |
| **Duplicate Exam Attempts / Race Conditions** | Student submits multiple times to game score | **State Validation & Atomic Transactions**: Submissions check `status === 'IN_PROGRESS'`. Submissions execute in a single atomic Prisma transaction (`$transaction`). | **VERIFIED / ATOMIC** |

---

## 2. Mobile Anti-Cheating & Integrity Engine

In an academic examination environment, maintaining fair conditions is critical. The system implements a client-server anti-cheating audit trail:

1. **Client Event Detection**:
   The React Native `useAntiCheating` hook attaches to the native `AppState` event dispatcher. When the student minimizes the app, opens another browser tab, or responds to an incoming phone call, the state transitions to `'inactive'` or `'background'`.
2. **Immediate User Warning**:
   A modal dialog warns the student that an integrity infraction has occurred.
3. **Audit Trail Logging**:
   An asynchronous event is logged to the backend database table `CheatingLog` linking the timestamp, event type (`APP_BACKGROUND`), and submission ID.
4. **Instructor Transparency**:
   In the Teacher's **Exam Analytics Screen**, students with recorded infractions are flagged with a red warning badge detailing exact violation counts for review during grading.
