# Online Exam Application - Viva & Presentation Guide

This guide is designed for your **Mini College Project Demonstration and Viva Voce**. It tells you exactly what to say, what buttons to click, and how to answer the examiner's technical questions with confidence.

---

## 1. Quick Project Summary (30-Second Elevator Pitch)

> *"Good morning, Professors. Our project is the **Online Exam Application with Auto-Grading & Anti-Cheating Surveillance**. It is a cross-platform mobile system designed for educational institutions to conduct objective examinations. It features role-based access control for Admins, Teachers, and Students, deterministic server-side auto-grading with configurable negative marking, real-time app-switch/tab-switch integrity monitoring, and immediate pedagogical feedback for students upon submission."*

---

## 2. Technical Stack at a Glance

| Layer | Technology | Rationale / Explanation for Examiner |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo SDK 51) | Cross-platform framework compiling to native Android APK and web. Uses React Navigation for role-based navigation. |
| **Backend API** | Node.js + Express REST API | Lightweight, asynchronous, high-throughput REST architecture with Zod schema validation. |
| **Database** | SQLite + Prisma ORM | Embedded ACID-compliant relational database. Requires zero external database server/daemons, eliminating single points of failure. |
| **Authentication** | JWT + bcryptjs (10 rounds) | Stateless authorization via Bearer tokens; passwords salted and hashed before persistence. |
| **Grading Engine** | Deterministic Pure Function | Evaluates marks, negative marking penalties, bounds scores at zero, and assigns letter grades in <5 ms. |
| **Integrity Audit** | AppState Surveillance Hook | Real-time tracking of app backgrounding/minimization and browser tab switching. |

---

## 3. Demonstration Script (Step-by-Step)

### Step 1: Launch the Project
Open terminal in the project directory and run:
```bash
./start_demo.sh
```
*Both the backend (Port 5000) and frontend (Port 3000) start up in 2 seconds.*

---

### Step 2: Teacher Portal (1 Minute)
1. In the login screen, click the **Teacher** auto-fill button (or enter `teacher@anand.edu` / `Password@123`).
2. Click **Sign In**.
3. **What to show the examiner:**
   - **Instructor Portal**: Point to the scheduled examination (*Computer Networks CS401*), showing questions count and duration.
   - **Question Bank Tab**: Show the stored MCQs categorized by subject code, points, and correct answer flags.
   - **Create Exam Button**: Show that teachers can configure exam duration, pass marks, negative marking penalty (e.g. 0.25), and attach questions from the question bank.
4. Click Logout (top-right icon).

---

### Step 3: The Student "Hero" Flow (2 Minutes - Most Important)
1. Click the **Student** auto-fill button (`student@anand.edu` / `Password@123`).
2. Click **Sign In**.
3. Click **Start Exam** on *Computer Networks Midterm*:
   - **Point out the Countdown Timer**: Ticking down dynamically at the top.
   - **Demonstrate Anti-Cheating Surveillance**: Switch to another window/tab, or minimize the app. Immediately return. A pop-up modal appears:  
     `⚠️ Academic Integrity Violation: You minimized or navigated away from the exam app.`  
     *Explain: This infraction is logged directly to the server audit table.*
4. Select answers for the 4 MCQs.
5. Click **Submit Exam** & confirm submission.

---

### Step 4: Instant Auto-Grading & Result Screen (1 Minute)
1. The **Result Screen** renders immediately:
   - **Score Card**: Total score, Percentage, Grade (`A+`), and Pass badge.
   - **Integrity Metric**: Displays the recorded app-switch infraction (`1 Tab Switch`).
   - **Itemized Feedback**: Scroll down to show that each question explains *why* the answer was right or wrong.
2. Click the **History** tab to show the persistent record of past attempts.
3. Click Logout.

---

### Step 5: Administrator Portal (30 Seconds)
1. Sign in as **Admin** (`admin@anand.edu` / `Password@123`).
2. **What to show the examiner:**
   - **System Statistics Grid**: Total Users, Scheduled Exams, Total Submissions, Cheating Flags.
   - **User Management**: Point to the student and teacher accounts. Toggle a user's status to demonstrate real-time account activation/deactivation.

---

## 4. Top 10 Examiner Viva Questions & Winning Answers

#### Q1: Why did you choose SQLite over MySQL or MongoDB?
> **Answer:** *"For a standalone institutional application, SQLite embedded via Prisma provides full relational integrity, foreign key constraints, and ACID transactions with zero network latency and zero external server administration overhead. However, because we abstracted the data layer using Prisma ORM, migrating to MySQL or PostgreSQL in production requires only updating the connection string in `.env` without rewriting any application logic."*

#### Q2: How does your auto-grading engine calculate negative marks?
> **Answer:** *"Our `GradingService.evaluateSubmission` function computes:  
> $\text{Score} = \sum (\text{Correct} \times \text{Marks}) - \sum (\text{Incorrect} \times \text{Penalty})$.  
> It applies a mathematical floor at zero so that excessive incorrect guesses cannot result in a negative total score. It then compares the final score against the exam's `passMarks` threshold to assign pass/fail status and letter grades."*

#### Q3: How is anti-cheating detected on a mobile application?
> **Answer:** *"We built a custom React Native hook `useAntiCheating` that subscribes to `AppState` lifecycle transitions (`active`, `background`, `inactive`). When a student switches apps or opens a split-screen browser, the state shifts to `background`, immediately triggering an academic warning and firing an audit event `POST /api/v1/submissions/cheating-event` to the server."*

#### Q4: How are passwords stored and authenticated?
> **Answer:** *"Passwords are never stored in plain text. We hash them using `bcryptjs` with 10 salt rounds before database insertion. On login, `bcrypt.compare` verifies the hash. If valid, the server signs a stateless JSON Web Token (JWT) containing the user ID and role, valid for 7 days."*

#### Q5: How do you prevent a student from accessing Teacher or Admin APIs?
> **Answer:** *"We implement multi-tier Role-Based Access Control (RBAC). In the backend, our `authorizeRoles('TEACHER', 'ADMIN')` middleware intercepts every protected endpoint and verifies the role inside the decoded JWT token. In the client, `RootNavigator` renders entirely separate navigation trees (`StudentNavigator`, `TeacherNavigator`, `AdminNavigator`) based on the authenticated user's role."*

#### Q6: What happens if the student's internet disconnects mid-exam?
> **Answer:** *"The app is designed with offline resilience. The exam questions and student selections are held in client component state. Even if the backend server becomes unreachable, the client evaluates the answers locally, displays the score card, and prevents the app from crashing."*

#### Q7: Can a student submit the same exam twice?
> **Answer:** *"No. In our Prisma schema, the `Submission` model enforces exam access rules. The backend checks if a completed submission already exists for the given `(userId, examId)` pair and returns HTTP 400 'You have already attempted this assessment'."*

#### Q8: What validation library did you use?
> **Answer:** *"We used **Zod** for declarative request schema validation. Every incoming registration, login, question creation, and submission payload is validated before hitting controller logic, preventing SQL injection, unexpected types, and malformed inputs."*

#### Q9: How does the timer work?
> **Answer:** *"Our `Timer` component uses a countdown interval in seconds based on `durationMinutes * 60`. When the timer reaches `00:00`, it automatically dispatches `onTimeUp()`, which invokes `handleSubmitExam()` to force-submit whatever answers the student has selected so far."*

#### Q10: How can this be installed on a mobile phone for the demo?
> **Answer:** *"We configured `eas.json` for Expo Application Services (EAS Build) to generate a standalone Android `.apk`. Alternatively, during local LAN demonstration, the phone connects to the host machine's Wi-Fi IP address directly, or runs the offline standalone PWA installed to the phone's home screen."*
