import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_system_design_doc(output_path):
    doc = docx.Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Color Palette
    PRIMARY = RGBColor(37, 99, 235)     # Royal Blue
    SECONDARY = RGBColor(15, 23, 42)   # Deep Slate
    TEXT = RGBColor(51, 65, 85)         # Slate 700
    MUTED = RGBColor(100, 116, 139)     # Slate 500
    LIGHT_BG = "F8FAFC"
    HEADER_BG = "1E3A8A"

    # Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("SYSTEM DESIGN & ARCHITECTURE DOCUMENT")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(24)
    title_run.font.bold = True
    title_run.font.color.rgb = PRIMARY

    # Subtitle
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Online Exam Application with Auto-Grading Using React Native, Node.js, Express.js, and MySQL")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(13)
    sub_run.font.italic = True
    sub_run.font.color.rgb = MUTED

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_run = meta_p.add_run("Core Focus: Front-End Design (Prototype) | Business Logic Design | Database Design\n")
    meta_run.font.size = Pt(10)
    meta_run.font.bold = True
    meta_run.font.color.rgb = SECONDARY

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Helper function for Section Headings
    def add_section_header(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(8)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = PRIMARY
        # Add horizontal rule under heading
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="2563EB"/></w:pBdr>')
        h._element.get_or_add_pPr().append(pBdr)

    def add_subheading(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = SECONDARY

    def add_p(text, bold_prefix="", space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            b_run = p.add_run(bold_prefix)
            b_run.font.name = "Calibri"
            b_run.font.size = Pt(11)
            b_run.font.bold = True
            b_run.font.color.rgb = SECONDARY
        run = p.add_run(text)
        run.font.name = "Calibri"
        run.font.size = Pt(11)
        run.font.color.rgb = TEXT
        return p

    def style_table(table, col_widths, headers, data):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Header Row
        hdr_cells = table.rows[0].cells
        for i, h_text in enumerate(headers):
            hdr_cells[i].text = h_text
            set_cell_background(hdr_cells[i], "1E3A8A")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = "Calibri"
                run.font.size = Pt(10)
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.add_row().cells
            bg = "FFFFFF" if r_idx % 2 == 0 else "F1F5F9"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                set_cell_background(row_cells[c_idx], bg)
                set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=140, right=140)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for run in p.runs:
                    run.font.name = "Calibri"
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = TEXT
        # Apply column widths
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    # =========================================================================
    # SECTION 1: FRONT-END DESIGN (PROTOTYPE)
    # =========================================================================
    add_section_header("1. FRONT-END DESIGN (PROTOTYPE)")

    add_subheading("1.1 Design Philosophy & User Experience (UX)")
    add_p(
        "The mobile front-end is developed using React Native (Expo) following a mobile-first, distraction-free assessment paradigm. "
        "The interface prioritizes high readability, minimal cognitive load during test execution, and instant visual feedback upon exam completion. "
        "A single codebase natively supports Android, iOS, and Web preview through responsive layout primitives."
    )

    add_subheading("1.2 Navigation Architecture & Hierarchy")
    add_p("The front-end utilizes a role-segregated navigation hierarchy managed by React Navigation. Route mounting is strictly guarded by the user's authenticated role:")

    front_nav_data = [
        ["Authentication Stack", "Public (Guest)", "LoginScreen, RegisterScreen", "JWT authentication, role assignment, password validation"],
        ["Student Navigator", "Role: STUDENT", "Bottom Tabs: Exams, History, Alerts, Help\nNested: ExamRunnerScreen, ResultScreen", "Timed exam attempt, question navigation, anti-cheating monitor, instant result card"],
        ["Teacher Navigator", "Role: TEACHER", "Bottom Tabs: Exams, Question Bank, Alerts, Help\nNested: CreateExamScreen, ExamAnalyticsScreen", "Question repository management, exam scheduling, class performance & infraction audit"],
        ["Admin Navigator", "Role: ADMIN", "Bottom Tabs: Dashboard, Alerts, Help", "System-wide KPI metrics, user account activation / deactivation"]
    ]
    t1 = doc.add_table(rows=1, cols=4)
    style_table(t1, [1.5, 1.3, 2.2, 2.0], ["Navigator Level", "Access Guard", "Component Screens", "Functional Responsibilities"], front_nav_data)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_subheading("1.3 Screen Prototype Layouts & Wireframe Descriptions")
    
    add_p("Dual input fields for credentials, error banner, submit button, and a dedicated 'Quick Fill for Evaluator Demo' bar with 1-click presets for Student, Teacher, and Admin personas.", "• Login & Registration Prototype: ")
    add_p("Renders active and upcoming tests as cards. Displays subject badge, duration, question count, pass marks, and negative marking penalty tags. Toggles between 'Start Exam Now' (if unattempted) and 'View Results' (if already submitted).", "• Student Dashboard Prototype: ")
    add_p("Displays a fixed top bar with a live countdown timer (Timer.js) that turns crimson under 2 minutes. Features a central Question Card with prominent prompt text, single-choice option selectors (A, B, C, D), a Question Quick-Jump grid with color-coded answered/unanswered pills, and a modal confirmation submit button.", "• Exam Runner (Timed Test Interface): ")
    add_p("Immediate post-submission presentation featuring a dynamic Pass/Fail trophy banner, total score, percentage, attempted/correct/incorrect counters, integrity audit summary (0 violations vs. app-switch count), and an itemized question-by-question review displaying chosen answer, correct key, and detailed explanation.", "• Instant Result Breakdown Prototype: ")
    add_p("Categorized repository view displaying question prompts, points, difficulty chips, and correct option badges. Includes an 'Add Question' modal with 4 option inputs and an active checkmark toggle to establish the answer key.", "• Question Bank Management Prototype: ")
    add_p("Assessment assembly screen enabling instructors to set title, description, duration in minutes, pass marks, negative marking rate, and pick questions from the bank using interactive checkbox cards.", "• Create & Schedule Exam Prototype: ")
    add_p("Analytics suite showing 4 primary KPI cards (Total Submissions, Average Score, Pass Rate %, High/Low Scores), a 4-tier score distribution bar graph (80-100%, 60-79%, 40-59%, <40%), and a student submissions table highlighting cheating infraction counts in red.", "• Exam Analytics Dashboard Prototype: ")
    add_p("System health overview cards (Users, Exams, Submissions, Cheating Incidents) and a comprehensive user list with instant 'Activate / Deactivate' status toggle buttons.", "• Administrator Dashboard Prototype: ")

    add_subheading("1.4 Mobile Anti-Cheating UI Flow")
    add_p(
        "Integrated via the custom hook 'useAntiCheating.js', the mobile app actively listens for native AppState changes. "
        "If a student navigates away from the exam app (e.g. switching to a browser, answering a phone call, or minimizing the window), "
        "an urgent modal alert informs the user that an academic integrity violation has been recorded. Simultaneously, the event is transmitted "
        "to the backend API and appended to the student's submission audit trail."
    )

    # =========================================================================
    # SECTION 2: BUSINESS LOGIC DESIGN
    # =========================================================================
    add_section_header("2. BUSINESS LOGIC DESIGN")

    add_subheading("2.1 Layered Controller-Service Architecture")
    add_p(
        "The backend REST API is architectured using a clean 3-tier pattern: Route -> Controller -> Service -> Data. "
        "Controllers handle HTTP serialization and request validation, while all critical grading, calculation, and security logic resides "
        "in isolated, testable service classes."
    )

    add_subheading("2.2 Core Deterministic Auto-Grading Engine (GradingService)")
    add_p(
        "The auto-grading module is implemented as a pure, deterministic service. Upon student submission, the engine evaluates submitted answers "
        "against the instructor's verified answer keys stored in the database according to strict mathematical scoring rules:"
    )

    add_p("Total Score = Sum of Marks Awarded for all questions in the exam.", "1. Overall Score Formula: ")
    add_p("If the student's selectedOptionId matches the correctOptionId, marksAwarded = question.marks.", "2. Correct Answer Evaluation: ")
    add_p("If selectedOptionId does not match correctOptionId, a negative penalty is applied: marksAwarded = - (exam.negativeMarking > 0 ? exam.negativeMarking : question.negativeMarks).", "3. Negative Marking Rule: ")
    add_p("If selectedOptionId is null or unattempted, marksAwarded = 0. Unattempted questions never incur negative marking penalties.", "4. Unattempted Immunity: ")
    add_p("To prevent students from receiving negative cumulative marks on an exam, the final score is floored at zero: Final Score = Math.max(0, Total Score). Raw negative scores are retained separately for statistical analytics.", "5. Floor Guard: ")
    add_p("Percentage = (Final Score / Total Possible Marks) * 100. Status is Passed if Final Score >= exam.passMarks; otherwise Failed.", "6. Pass / Fail Status: ")

    add_subheading("2.3 Security, Authorization & Session Management Logic")
    add_p(
        "Authentication is stateless, utilizing JSON Web Tokens (JWT) signed with a secure server secret. Passwords are cryptographically "
        "hashed using Bcrypt with a salt work factor of 10 prior to database storage. Role-Based Access Control (RBAC) middleware intercepts "
        "every incoming request to ensure students cannot access teacher endpoints, and teachers cannot modify records owned by other instructors."
    )
    add_p(
        "Crucially, the exam delivery endpoint (/exams/:id/take) applies server-side property stripping: all 'isCorrect' booleans are deleted "
        "from the options payload before transmission to the mobile client. Evaluation occurs solely on the server inside an atomic database transaction ($transaction), "
        "guaranteeing answer security and data integrity."
    )

    add_subheading("2.4 Class Performance Analytics Computation")
    add_p(
        "The analytics controller computes descriptive statistics across all completed submissions for a given exam: "
        "Arithmetic Mean (Average Score), Maximum and Minimum scores, Class Pass Rate percentage, and categorizes students into 4 performance distribution "
        "bands: Excellent (>=80%), Good (60-79%), Average (40-59%), and Fail (<40%)."
    )

    # =========================================================================
    # SECTION 3: DATABASE DESIGN
    # =========================================================================
    add_section_header("3. DATABASE DESIGN")

    add_subheading("3.1 DBMS Selection & Architectural Rationale")
    add_p(
        "MySQL 8.0 was chosen as the production relational database management system due to its strict ACID compliance, relational integrity enforcement, "
        "support for foreign key cascade constraints, and performance under concurrent read/write transactions. "
        "Prisma ORM serves as the type-safe abstraction layer, providing automated schema migrations, connection pooling, and parameterized query execution."
    )

    add_subheading("3.2 Entity-Relationship (ER) Architecture")
    add_p("The relational schema consists of 11 distinct entities modeling the complete examination lifecycle:")

    db_entities_data = [
        ["User", "Core user entity storing name, unique email, hashed password, role (ADMIN, TEACHER, STUDENT), and active status."],
        ["Subject", "Academic department or course classification (e.g. Computer Networks, Operating Systems) with unique code."],
        ["Question", "Objective question bank repository item with difficulty, marks, negative penalty, explanation, and subject reference."],
        ["Option", "Multiple-choice alternatives linked to a question, containing option text and the boolean answer key (isCorrect)."],
        ["Exam", "Scheduled assessment containing duration in minutes, pass marks, negative marking rate, and status (SCHEDULED, COMPLETED)."],
        ["ExamQuestion", "Join entity establishing an ordered, many-to-many relationship between exams and question bank items."],
        ["Submission", "Student exam attempt tracking start time, submission time, final score, percentage, pass/fail status, and completion state."],
        ["SubmissionAnswer", "Itemized audit log recording the student's selected option, correctness, and marks awarded for each individual question."],
        ["CheatingLog", "Integrity audit trail logging backgrounding events, focus loss, and timestamps during an active exam attempt."],
        ["Notification", "System alerts sent to users regarding scheduled tests, upcoming deadlines, and declared examination results."],
        ["SupportTicket", "Help desk inquiries and student support issues filed during registration or examination sessions."]
    ]
    t2 = doc.add_table(rows=1, cols=2)
    style_table(t2, [2.0, 5.0], ["Entity Name", "Functional Purpose & Relational Scope"], db_entities_data)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_subheading("3.3 Comprehensive Data Dictionary")
    add_p("Detailed specifications of the primary database tables, attributes, data types, and constraints:")

    data_dict = [
        ["User", "id", "VARCHAR(36)", "PK, UUID", "Unique identifier for user account"],
        ["User", "email", "VARCHAR(191)", "UNIQUE, NOT NULL", "Login email address"],
        ["User", "password", "VARCHAR(255)", "NOT NULL", "Bcrypt-hashed password string"],
        ["User", "role", "ENUM/VARCHAR", "DEFAULT 'STUDENT'", "'ADMIN', 'TEACHER', or 'STUDENT'"],
        ["User", "isActive", "BOOLEAN", "DEFAULT TRUE", "Account activation flag"],
        ["Question", "id", "VARCHAR(36)", "PK, UUID", "Unique question bank identifier"],
        ["Question", "subjectId", "VARCHAR(36)", "FK -> Subject.id", "Cascade delete on subject removal"],
        ["Question", "text", "TEXT", "NOT NULL", "Question stem/prompt"],
        ["Question", "marks", "DOUBLE / FLOAT", "DEFAULT 1.0", "Points awarded on correct answer"],
        ["Question", "negativeMarks", "DOUBLE / FLOAT", "DEFAULT 0.0", "Penalty deducted on wrong answer"],
        ["Option", "id", "VARCHAR(36)", "PK, UUID", "Unique option choice identifier"],
        ["Option", "questionId", "VARCHAR(36)", "FK -> Question.id", "Cascade delete on question removal"],
        ["Option", "text", "TEXT", "NOT NULL", "Option choice display text"],
        ["Option", "isCorrect", "BOOLEAN", "DEFAULT FALSE", "Answer key indicator"],
        ["Exam", "id", "VARCHAR(36)", "PK, UUID", "Unique exam session identifier"],
        ["Exam", "durationMinutes", "INTEGER", "DEFAULT 30", "Exam allotted countdown time"],
        ["Exam", "passMarks", "DOUBLE / FLOAT", "DEFAULT 40.0", "Minimum points required to pass"],
        ["Exam", "negativeMarking", "DOUBLE / FLOAT", "DEFAULT 0.0", "Exam-level negative marking rate"],
        ["Submission", "id", "VARCHAR(36)", "PK, UUID", "Unique exam attempt record identifier"],
        ["Submission", "examId", "VARCHAR(36)", "FK -> Exam.id", "Target exam reference"],
        ["Submission", "studentId", "VARCHAR(36)", "FK -> User.id", "Candidate student reference"],
        ["Submission", "score", "DOUBLE / FLOAT", "DEFAULT 0.0", "Auto-graded final score"],
        ["Submission", "percentage", "DOUBLE / FLOAT", "DEFAULT 0.0", "Normalized percentage score"],
        ["Submission", "passed", "BOOLEAN", "DEFAULT FALSE", "Pass / fail result outcome"],
        ["CheatingLog", "id", "VARCHAR(36)", "PK, UUID", "Unique audit event identifier"],
        ["CheatingLog", "submissionId", "VARCHAR(36)", "FK -> Submission.id", "Linked submission attempt"],
        ["CheatingLog", "eventType", "VARCHAR(50)", "NOT NULL", "'APP_BACKGROUND', 'TAB_SWITCH'"],
        ["CheatingLog", "timestamp", "DATETIME", "DEFAULT NOW()", "Exact infraction occurrence time"]
    ]
    t3 = doc.add_table(rows=1, cols=5)
    style_table(t3, [1.1, 1.2, 1.2, 1.4, 2.1], ["Table", "Field Name", "Data Type", "Constraints", "Description"], data_dict)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_subheading("3.4 Data Integrity Constraints & Indexing Strategy")
    add_p("All foreign key relationships enforce ON DELETE CASCADE where appropriate, ensuring that deleting an exam or question cleans up associated options, links, and answers without leaving orphaned rows.", "• Referential Integrity: ")
    add_p("To guarantee high query throughput under concurrent exam submissions, database indexes are applied on all foreign key columns (e.g. Question.subjectId, Exam.teacherId, Submission.examId, Submission.studentId).", "• Indexing Optimization: ")
    add_p("Database writes during exam submission execute within an atomic Prisma transaction ($transaction), ensuring that the submission status update and answer item creations either succeed together or roll back entirely.", "• Transactional Atomicity: ")

    # Save Document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_system_design_doc("/media/sober/Windows-SSD/Users/sober/D_Files/Projects/Anand_Project/docs/System_Design_Document.docx")
