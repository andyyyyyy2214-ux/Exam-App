const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Support demo mode tokens seamlessly
    if (token.startsWith('demo-token-')) {
      const demoRole = token.replace('demo-token-', '').toUpperCase();
      const demoUser = await prisma.user.findFirst({
        where: { role: demoRole, isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'anand_secure_jwt_token_secret_key_2026_super_secure'
    );

    // Fetch user from DB (or attach decoded payload)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Role-Based Authorization guard
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
