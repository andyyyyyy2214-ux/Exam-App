# Online Exam Application with Auto-Grading

> **Motto**: *"Maximum visible functionality with minimum implementation complexity."*

A cross-platform assessment platform featuring instant deterministic auto-grading, mobile anti-cheating detection, categorized question banks, role-based dashboards, and class analytics.

---

## 🌟 Key Highlights & Modules

* **Cross-Platform Mobile App**: Built with **React Native (Expo)** supporting Android, iOS, and Web preview.
* **Instant Auto-Grading Engine**: Server-side evaluation supporting single-choice, multiple-choice, negative marking penalties, and unattempted question immunity.
* **Mobile Anti-Cheating**: `AppState` monitor detects and logs app minimization and background switching during active exam sessions.
* **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Admin**, **Teacher (Faculty)**, and **Student**.
* **Comprehensive Quality Engineering**:
  * **Unit Testing**: Jest test suite verifying boundary conditions and negative scoring.
  * **Integration Testing**: Supertest verifying API endpoints, auth guards, and error handlers.
  * **Performance Benchmarking**: Autocannon load testing proving **915 req/sec** throughput with **55 ms** average latency.
  * **Security Validation**: Parameterized SQL queries via Prisma ORM (zero SQLi), IDOR protection, salted password hashing with Bcrypt, and answer key stripping.

---

## 🏗️ System Architecture

```text
/anand-exam-app/
├── client/                     # React Native (Expo) Mobile App
│   ├── src/
│   │   ├── api/                # Axios API client
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── hooks/              # useAntiCheating hook (AppState listener)
│   │   ├── navigation/         # Role-based Tab & Stack navigators
│   │   ├── screens/            # 10 dedicated screens across all 9 modules
│   │   └── theme/              # Color system & styling
│   └── package.json
│
├── server/                     # Node.js 22 + Express.js 5 REST API
│   ├── src/
│   │   ├── controllers/        # Route controllers (Auth, Exam, Grading, Analytics)
│   │   ├── middleware/         # JWT Auth, Zod Validation, Centralized Error Handling
│   │   ├── services/           # Deterministic Auto-Grading Engine
│   │   └── app.js              # Express app & health check
│   ├── prisma/                 # Prisma Schema & MySQL model definitions
│   ├── scripts/                # Database seed script & self-contained load test
│   ├── tests/                  # Unit & Integration test suites
│   └── package.json
│
└── docs/                       # Academic Rubric Deliverables
    ├── system_architecture.md  # 5 Mermaid diagrams (System, FE, BE, ERD, Sequence)
    ├── api_specification.md    # Complete REST API route documentation
    ├── test_case_matrix.md     # Black-box, Unit, and Integration test matrix
    ├── security_validation.md  # OWASP threat model & integrity report
    ├── performance_report.md   # Empirical Autocannon benchmark report
    ├── bug_tracking_log.md     # Quality assurance defect resolution history
    └── user_manual.md          # Step-by-step user guide & 5-minute presentation script
```

---

## 🚀 Quick Start Guide

### 1. Activate Environment
```bash
source ./activate.sh
```

### 2. Start Backend Server
```bash
cd server
npm start
# API live on http://localhost:5000
# Health check: http://localhost:5000/health
```

### 3. Launch Frontend (React Native / Expo)
```bash
cd client
# Run in Web Browser (Recommended for instant laptop evaluation):
npm run web

# Or run via Expo Go on iOS/Android:
npm start
```

---

## 🧪 Automated Testing & Verification

Inside `/server`:

```bash
# Run All Unit Tests (Auto-Grading Engine):
npm run test:unit

# Run All Integration Tests (API Endpoints):
npm run test:integration

# Run Automated Performance Load Test:
npm run load-test
```

---

## 👥 Demo Accounts (Password for all: `Password@123`)

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Student** | `student@anand.edu` | Browse exams, take timed test, anti-cheating alerts, instant auto-graded score card |
| **Teacher** | `teacher@anand.edu` | Manage question bank, schedule exams, set negative marks, view class performance analytics |
| **Admin** | `admin@anand.edu` | System overview KPIs, activate / deactivate user accounts |

*(Tip: The login screen contains 1-click quick-fill buttons for instant demo switching!)*

---

## 📑 Complete Documentation Links
* [System Architecture & Diagrams](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/system_architecture.md)
* [API Specification](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/api_specification.md)
* [Test Plan & Test Case Matrix](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/test_case_matrix.md)
* [Security Validation Report](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/security_validation.md)
* [Performance Load Test Report](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/performance_report.md)
* [Defect & Bug Tracking Log](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/bug_tracking_log.md)
* [User Manual & Presentation Script](file:///media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/user_manual.md)
