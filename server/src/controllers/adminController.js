const prisma = require('../config/db');

// @route   GET /api/v1/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/v1/admin/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: typeof isActive === 'boolean' ? isActive : undefined },
      select: { id: true, name: true, email: true, isActive: true },
    });

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.name} status updated to ${updatedUser.isActive ? 'Active' : 'Deactivated'}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/admin/stats
const getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, studentsCount, teachersCount, totalExams, totalSubmissions, cheatingIncidents] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TEACHER' } }),
        prisma.exam.count(),
        prisma.submission.count(),
        prisma.cheatingLog.count(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        studentsCount,
        teachersCount,
        totalExams,
        totalSubmissions,
        cheatingIncidents,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleUserStatus, getSystemStats };
