# System Architecture & Technical Design

**Project**: Online Exam Application with Auto-Grading  
**Stack**: React Native (Expo), Node.js (v22), Express.js (v5), MySQL (8.0), Prisma ORM

---

## 1. High-Level System Architecture

The system employs a decoupled, client-server architecture. The cross-platform mobile client communicates over HTTPS/JSON REST APIs with an Express.js application gateway, which orchestrates authentication, exam sessions, deterministic auto-grading, and persists relational data to MySQL via Prisma ORM.

```mermaid
graph TD
    subgraph Mobile Client [React Native / Expo Client]
        UI[Mobile Views: iOS / Android / Web]
        AC[Anti-Cheating Hook: AppState Monitor]
        AUTH_CTX[Auth Context & JWT Storage]
        AXIOS[Axios API Client]
        UI --> AUTH_CTX
        UI --> AC
        AUTH_CTX --> AXIOS
        AC --> AXIOS
    end

    subgraph Backend Server [Node.js + Express 5]
        GATEWAY[API Gateway & Rate Limiter]
        AUTH_MW[JWT Auth & RBAC Middleware]
        VAL_MW[Zod Schema Validator]
        
        CTRL_AUTH[Auth Controller]
        CTRL_EXAM[Exam Controller]
        CTRL_SUB[Submission Controller]
        CTRL_ANALYTICS[Analytics Controller]
        
        SERVICE_GRADE[Deterministic Auto-Grading Engine]
        
        GATEWAY --> AUTH_MW --> VAL_MW
        VAL_MW --> CTRL_AUTH
        VAL_MW --> CTRL_EXAM
        VAL_MW --> CTRL_SUB
        VAL_MW --> CTRL_ANALYTICS
        
        CTRL_SUB --> SERVICE_GRADE
    end

    subgraph Database Layer [MySQL 8.0]
        PRISMA[Prisma ORM Client]
        MYSQL[(MySQL Database)]
        
        CTRL_AUTH --> PRISMA
        CTRL_EXAM --> PRISMA
        CTRL_SUB --> PRISMA
        CTRL_ANALYTICS --> PRISMA
        PRISMA --> MYSQL
    end

    AXIOS -->|REST API JSON over HTTP| GATEWAY
```

---

## 2. Frontend Architecture (React Native)

The mobile client uses React Navigation with role-based segregation, preventing unauthorized route mounts on the client device.

```mermaid
graph TD
    ROOT[RootNavigator] --> IS_AUTH{Authenticated?}
    
    IS_AUTH -->|No| AUTH_STACK[Auth Stack: Login / Register]
    IS_AUTH -->|Yes| ROLE_GUARD{User Role}
    
    ROLE_GUARD -->|STUDENT| STUDENT_TABS[Student Tabs]
    ROLE_GUARD -->|TEACHER| TEACHER_TABS[Teacher Tabs]
    ROLE_GUARD -->|ADMIN| ADMIN_TABS[Admin Tabs]
    
    subgraph Student Flow
        STUDENT_TABS --> S_EXAMS[Available Exams]
        S_EXAMS --> S_RUNNER[Exam Runner & Timer]
        S_RUNNER --> S_RESULT[Instant Result Breakdown]
        STUDENT_TABS --> S_HIST[Performance History]
    end
    
    subgraph Teacher Flow
        TEACHER_TABS --> T_EXAMS[Manage Exams]
        T_EXAMS --> T_CREATE[Create & Schedule Exam]
        T_EXAMS --> T_ANALYTICS[Exam Analytics & Submissions]
        TEACHER_TABS --> T_BANK[Question Bank Repository]
    end
    
    subgraph Admin Flow
        ADMIN_TABS --> A_DASH[System KPIs & User Toggle]
    end
```

---

## 3. Backend Layered Architecture

The backend strictly follows the **Controller-Service-Data** separation of concerns:

```mermaid
flowchart LR
    REQ[HTTP Request] --> ROUTE[Express Route]
    ROUTE --> AUTH[JWT & RBAC Middleware]
    AUTH --> VAL[Zod Validator]
    VAL --> CTRL[Controller Layer]
    CTRL --> SERVICE[Business Logic / Grading Engine]
    SERVICE --> ORM[Prisma Client]
    ORM --> DB[(MySQL)]
    DB --> ORM --> CTRL --> RES[HTTP Standardized JSON Response]
```

---

## 4. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ QUESTION : "creates (Teacher)"
    USER ||--o{ EXAM : "schedules (Teacher)"
    USER ||--o{ SUBMISSION : "takes (Student)"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ SUPPORT_TICKET : "files"

    SUBJECT ||--o{ QUESTION : "categorizes"
    SUBJECT ||--o{ EXAM : "contains"

    QUESTION ||--|{ OPTION : "has multiple"
    QUESTION ||--o{ EXAM_QUESTION : "linked in"
    EXAM ||--o{ EXAM_QUESTION : "comprises"

    EXAM ||--o{ SUBMISSION : "attempted via"
    SUBMISSION ||--o{ SUBMISSION_ANSWER : "records"
    QUESTION ||--o{ SUBMISSION_ANSWER : "evaluated in"
    SUBMISSION ||--o{ CHEATING_LOG : "logs infractions"

    USER {
        string id PK
        string name
        string email
        string password
        enum role "ADMIN | TEACHER | STUDENT"
        boolean isActive
        datetime createdAt
    }

    SUBJECT {
        string id PK
        string name
        string code
        string description
    }

    QUESTION {
        string id PK
        string subjectId FK
        string teacherId FK
        string text
        string explanation
        enum type "MCQ | TRUE_FALSE"
        enum difficulty "EASY | MEDIUM | HARD"
        float marks
        float negativeMarks
    }

    OPTION {
        string id PK
        string questionId FK
        string text
        boolean isCorrect
    }

    EXAM {
        string id PK
        string title
        string subjectId FK
        string teacherId FK
        int durationMinutes
        float totalMarks
        float passMarks
        float negativeMarking
        enum status "DRAFT | SCHEDULED | COMPLETED"
    }

    SUBMISSION {
        string id PK
        string examId FK
        string studentId FK
        datetime startedAt
        datetime submittedAt
        float score
        float totalMarks
        float percentage
        boolean passed
        enum status "IN_PROGRESS | SUBMITTED | TIMED_OUT"
    }

    SUBMISSION_ANSWER {
        string id PK
        string submissionId FK
        string questionId FK
        string selectedOptionId
        boolean isCorrect
        float marksAwarded
    }

    CHEATING_LOG {
        string id PK
        string submissionId FK
        string eventType "APP_BACKGROUND | TAB_SWITCH"
        datetime timestamp
        string details
    }
```

---

## 5. Auto-Grading & Exam Lifecycle Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Client as React Native App
    participant Server as Express REST API
    participant Engine as Auto-Grading Engine
    participant DB as MySQL (Prisma)

    Student->>Client: Open Available Exam
    Client->>Server: POST /api/v1/submissions/start { examId }
    Server->>DB: Create Submission (status: IN_PROGRESS)
    Server-->>Client: 201 Created { submissionId, startedAt }

    Client->>Server: GET /api/v1/exams/:id/take
    Note over Server: Strips isCorrect field from options
    Server-->>Client: 200 OK (Questions without answer key)

    Client->>Client: Launch Timer & AppState Listener
    opt Student minimizes app during exam
        Client->>Server: POST /api/v1/submissions/cheating-event
        Server->>DB: Insert CheatingLog record
    end

    Student->>Client: Select Answers & Click "Submit Exam"
    Client->>Server: POST /api/v1/submissions/submit { submissionId, answers }
    
    Server->>DB: Fetch Exam & Questions with Answer Key (options.isCorrect)
    Server->>Engine: evaluateSubmission({ exam, questions, submittedAnswers })
    Note over Engine: Pure deterministic scoring with negative marking
    Engine-->>Server: { score, percentage, passed, detailedAnswers }
    
    Server->>DB: Prisma Transaction (Save Answers & Update Submission to SUBMITTED)
    Server-->>Client: 200 OK (Final Score, Pass/Fail, Summary)
    Client->>Student: Render Result Screen & Itemized Review
```
