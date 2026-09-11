const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'anand_secure_jwt_token_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    role = (role || 'STUDENT').toUpperCase();

    // ── Role Whitelist Enforcement ──────────────────────────────────────────
    // Parse comma-separated whitelist from .env
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const teacherEmails = (process.env.TEACHER_EMAILS || '')
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

    if (role === 'ADMIN') {
      if (!adminEmails.includes(email)) {
        // Silently downgrade — don't tell caller which emails are whitelisted
        role = 'STUDENT';
      }
    } else if (role === 'TEACHER') {
      if (teacherEmails.length > 0 && !teacherEmails.includes(email)) {
        role = 'STUDENT';
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    let existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) {
        const token = generateToken(existingUser);
        return res.status(200).json({
          success: true,
          message: 'Account already exists. Signed in automatically.',
          data: { user: existingUser, token },
        });
      }
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists. Please sign in with your password.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an admin.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, getMe };
