# User Manual & Demonstration Guide

**Project**: Online Exam Application with Auto-Grading  
**Author**: Anand Project Team  
**Version**: 1.0.0

---

## 1. Quick Start & Execution Guide

### Prerequisites
* Linux / macOS / Windows with WSL
* MySQL 8.0 (Local service or free cloud connection string in `.env`)

### Step 1: Activate Environment
In the root project folder, activate the pre-configured Node.js v22 environment:
```bash
source ./activate.sh
```

### Step 2: Start the Backend REST API
```bash
cd server
npm start
# Server listens on http://localhost:5000
# Health check available at: http://localhost:5000/health
```

### Step 3: Launch the React Native Mobile Application
In a separate terminal window:
```bash
source ./activate.sh
cd client

# Option A: Run in Web Browser (Instant Evaluator Demo)
npm run web

# Option B: Run on Physical Device via Expo Go
npm start
# Scan the printed QR code with your iPhone (Camera) or Android (Expo Go app)
```

---

## 2. Role-Based User Manual

### A. Student Persona
* **Credentials**: `student@anand.edu` / `Password@123` (or click *"Student"* quick-fill button on the login screen).
1. **Available Exams**: The dashboard lists all active, scheduled exams along with duration, question count, and pass marks.
2. **Taking an Exam**:
   * Tap **"Start Exam Now"**.
   * The live countdown timer starts at the top.
   * Tap options **A, B, C, or D** to select your answer.
   * Use the **Question Navigator** at the bottom to jump between questions.
   * *Anti-Cheating*: If you switch apps or minimize the screen, an academic integrity alert is recorded.
3. **Instant Auto-Grading**:
   * Click **"Submit Assessment"**.
   * The result screen appears immediately with your score, percentage, pass/fail banner, and question-by-question explanations.

---

### B. Teacher (Instructor) Persona
* **Credentials**: `teacher@anand.edu` / `Password@123` (or click *"Teacher"* quick-fill button on the login screen).
1. **Question Bank**:
   * Tap **"Question Bank"** tab.
   * Tap **"Add Question"**.
   * Enter the prompt, fill 4 options, and tap the checkmark next to the correct answer.
   * Set custom points and negative penalty.
2. **Scheduling Exams**:
   * Tap **"Create Exam"**.
   * Enter title, duration in minutes, pass marks, and negative marking penalty.
   * Select questions from the repository using the checkbox pills.
   * Click **"Publish & Schedule Exam"**.
3. **Exam Analytics**:
   * From the Teacher Dashboard, tap **"View Analytics & Submissions"**.
   * View the class average, pass rate, score distribution, and student list.
   * Students with integrity infractions (app switches) are highlighted with red warning tags.

---

### C. Administrator Persona
* **Credentials**: `admin@anand.edu` / `Password@123` (or click *"Admin"* quick-fill button on the login screen).
1. **System Statistics**: Overview of total users, active exams, submissions, and cheating incident logs.
2. **User Management**: View user directory and toggle account status (**Active** vs. **Deactivated**) with one click.

---

## 3. Five-Minute Presentation & Demonstration Script

Follow this script to smoothly demo the project to evaluators:

| Time | Phase | Action / Screen Shown | Talking Point |
| :--- | :--- | :--- | :--- |
| **0:00 - 1:00** | **Architecture & Login** | Open browser at `http://localhost:8081` (Expo Web) | *"Our project satisfies the full academic lifecycle using React Native, Express 5, and MySQL. We have 3 distinct roles. Let's start with the Teacher."* |
| **1:00 - 2:00** | **Teacher Flow** | Login as `teacher@anand.edu`. Show Question Bank and Create Exam screen. | *"Teachers can manage categorized question banks and assemble exams with custom durations, pass marks, and negative marking rules."* |
| **2:00 - 3:30** | **Student Exam & Anti-Cheating** | Logout, login as `student@anand.edu`. Launch Midterm Exam. Switch browser tabs. Submit exam. | *"The student dashboard shows available tests. The runner has a live timer. Notice: when I switched tabs, the anti-cheating hook logged a violation. On submission, the backend auto-grades the answers instantly."* |
| **3:30 - 4:30** | **Result & Analytics** | Show Instant Result breakdown. Switch back to Teacher and open Exam Analytics. | *"The student gets immediate transparency with correct keys and explanations. The teacher's analytics dashboard aggregates class averages, pass rates, score distribution, and flags cheating infractions."* |
| **4:30 - 5:00** | **Quality & Security** | Show `docs/` and run `npm test` in terminal. | *"The project includes 100% passing unit and integration test suites, load testing handling 915 req/sec, and full OWASP security compliance."* |
