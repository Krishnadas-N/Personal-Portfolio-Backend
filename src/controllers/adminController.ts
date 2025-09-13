import { Request, Response } from 'express';
import Admin from '../models/Admin';
import User from '../models/User';
import Contact from '../models/Contact';
import Project from '../models/Project';
import Blog from '../models/Blog';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { generateToken } from '../middlewares/auth.middleware';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if admin exists
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if admin is active
  if (!admin.isActive) {
    throw new AppError('Admin account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate token
  const token = generateToken({ adminId: admin._id });

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      token
    }
  });
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalContacts,
    totalProjects,
    totalBlogs,
    recentContacts,
    recentProjects,
    recentBlogs
  ] = await Promise.all([
    User.countDocuments(),
    Contact.countDocuments(),
    Project.countDocuments(),
    Blog.countDocuments(),
    Contact.find().sort({ createdAt: -1 }).limit(5).select('name email subject status createdAt'),
    Project.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
    Blog.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt')
  ]);

  // Get contact status stats
  const contactStats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get project status stats
  const projectStats = await Project.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get blog status stats
  const blogStats = await Blog.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalContacts,
        totalProjects,
        totalBlogs
      },
      contactStats,
      projectStats,
      blogStats,
      recent: {
        contacts: recentContacts,
        projects: recentProjects,
        blogs: recentBlogs
      }
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    role,
    isActive,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const query: any = {};

  // Apply filters
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .select('-password');

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle
// @access  Private (Admin)
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
export const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.admin
  });
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
export const updateAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, profileImage } = req.body;

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      username: username || req.admin.username,
      email: email || req.admin.email,
      profileImage: profileImage || req.admin.profileImage,
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'Admin profile updated successfully',
    data: updatedAdmin
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
export const changeAdminPassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get admin with password
  const admin = await Admin.findById(req.admin._id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await admin!.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  admin!.password = newPassword;
  await admin!.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Super Admin)
export const getSystemLogs = asyncHandler(async (req: Request, res: Response) => {
  // This would typically integrate with a logging service
  // For now, we'll return a placeholder response
  res.json({
    success: true,
    message: 'System logs endpoint - integrate with logging service',
    data: []
  });
});

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    userStats,
    contactStats,
    projectStats,
    blogStats
  ] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]),
    Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } }
        }
      }
    ]),
    Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          featured: { $sum: { $cond: ['$featured', 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } }
        }
      }
    ]),
    Blog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          featured: { $sum: { $cond: ['$isFeatured', 1, 0] } }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      users: userStats[0] || {},
      contacts: contactStats[0] || {},
      projects: projectStats[0] || {},
      blogs: blogStats[0] || {}
    }
  });
});
