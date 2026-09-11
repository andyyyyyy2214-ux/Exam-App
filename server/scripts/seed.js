const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  try {
    // 1. Clean existing records in cascade order
    await prisma.cheatingLog.deleteMany({});
    await prisma.submissionAnswer.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.examQuestion.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.option.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Hash default password
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // 3. Create Users
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@anand.edu',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const teacher1 = await prisma.user.create({
      data: {
        name: 'Dr. Anand Sharma',
        email: 'teacher@anand.edu',
        password: hashedPassword,
        role: 'TEACHER',
      },
    });

    const student1 = await prisma.user.create({
      data: {
        name: 'Rahul Verma',
        email: 'student@anand.edu',
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    console.log('✅ Seeded Users (Admin, Teacher, Student)');

    // 4. Create Subjects
    const netSubject = await prisma.subject.create({
      data: {
        name: 'Computer Networks',
        code: 'CS401',
        description: 'Protocols, OSI model, IP addressing, and routing algorithms.',
      },
    });

    const osSubject = await prisma.subject.create({
      data: {
        name: 'Operating Systems',
        code: 'CS301',
        description: 'Process scheduling, memory management, and file systems.',
      },
    });

    console.log('✅ Seeded Subjects (CS401, CS301)');

    // 5. Create Questions
    const q1 = await prisma.question.create({
      data: {
        subjectId: netSubject.id,
        teacherId: teacher1.id,
        text: 'Which protocol is used to map an IP address to a physical MAC address?',
        explanation: 'ARP (Address Resolution Protocol) resolves IP addresses to physical MAC addresses on a local network.',
        type: 'MCQ',
        difficulty: 'EASY',
        marks: 2.0,
        negativeMarks: 0.5,
        options: {
          create: [
            { text: 'ARP', isCorrect: true },
            { text: 'RARP', isCorrect: false },
            { text: 'DNS', isCorrect: false },
            { text: 'DHCP', isCorrect: false },
          ],
        },
      },
    });

    const q2 = await prisma.question.create({
      data: {
        subjectId: netSubject.id,
        teacherId: teacher1.id,
        text: 'What is the default port number for HTTPS secure communication?',
        explanation: 'HTTPS operates over SSL/TLS using default port 443.',
        type: 'MCQ',
        difficulty: 'EASY',
        marks: 2.0,
        negativeMarks: 0.5,
        options: {
          create: [
            { text: '80', isCorrect: false },
            { text: '443', isCorrect: true },
            { text: '8080', isCorrect: false },
            { text: '22', isCorrect: false },
          ],
        },
      },
    });

    const q3 = await prisma.question.create({
      data: {
        subjectId: netSubject.id,
        teacherId: teacher1.id,
        text: 'Is UDP a connection-oriented and guaranteed-delivery transport protocol?',
        explanation: 'UDP is connectionless and does not guarantee packet delivery (unlike TCP).',
        type: 'TRUE_FALSE',
        difficulty: 'MEDIUM',
        marks: 1.0,
        negativeMarks: 0.25,
        options: {
          create: [
            { text: 'True', isCorrect: false },
            { text: 'False', isCorrect: true },
          ],
        },
      },
    });

    const q4 = await prisma.question.create({
      data: {
        subjectId: netSubject.id,
        teacherId: teacher1.id,
        text: 'In the IPv4 header, what does the TTL (Time to Live) field prevent?',
        explanation: 'TTL is decremented at each hop to prevent routing loops from cycling packets indefinitely.',
        type: 'MCQ',
        difficulty: 'HARD',
        marks: 3.0,
        negativeMarks: 1.0,
        options: {
          create: [
            { text: 'Data corruption', isCorrect: false },
            { text: 'Infinite packet loops', isCorrect: true },
            { text: 'Unauthorized access', isCorrect: false },
            { text: 'Buffer overflows', isCorrect: false },
          ],
        },
      },
    });

    console.log('✅ Seeded 4 Objective Questions with Options');

    // 6. Create Exam & Link Questions
    const exam = await prisma.exam.create({
      data: {
        title: 'Midterm Assessment: Computer Networks',
        description: 'Objective exam on OSI layers, IP protocols, and transport mechanisms. Negative marking applies.',
        subjectId: netSubject.id,
        teacherId: teacher1.id,
        durationMinutes: 15,
        totalMarks: 8.0,
        passMarks: 4.0,
        negativeMarking: 0.5,
        status: 'SCHEDULED',
        scheduledAt: new Date(),
        examQuestions: {
          create: [
            { questionId: q1.id, orderIndex: 0 },
            { questionId: q2.id, orderIndex: 1 },
            { questionId: q3.id, orderIndex: 2 },
            { questionId: q4.id, orderIndex: 3 },
          ],
        },
      },
    });

    console.log(`✅ Seeded Exam: "${exam.title}" (Pass: 4.0 / Total: 8.0)`);

    // 7. Seed Notifications
    await prisma.notification.create({
      data: {
        userId: student1.id,
        title: 'Exam Scheduled',
        message: 'Midterm Assessment: Computer Networks is now live and available for attempts.',
      },
    });

    console.log('🎉 Seeding completed successfully!');
    console.log('-------------------------------------------');
    console.log('Test Accounts (Password for all: Password@123):');
    console.log('Admin:   admin@anand.edu');
    console.log('Teacher: teacher@anand.edu');
    console.log('Student: student@anand.edu');
    console.log('-------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
