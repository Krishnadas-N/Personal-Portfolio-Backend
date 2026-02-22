import { Request, Response } from 'express';
import Skill from '../models/Skill';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getSkills = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 50, 
    category,
    level,
    categories,
    levels,
    search,
    sort = 'name',
    order = 'asc'
  } = req.query;

  const isCategoriesView = categories === 'true' || categories === '1';
  const isLevelsView = levels === 'true' || levels === '1';

  if (isCategoriesView || isLevelsView) {
    const [categoryStats, levelStats] = await Promise.all([
      isCategoriesView
        ? Skill.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
        : Promise.resolve([]),
      isLevelsView
        ? Skill.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
        : Promise.resolve([])
    ]);

    res.json({
      success: true,
      data: isCategoriesView && isLevelsView
        ? { categories: categoryStats, levels: levelStats }
        : isCategoriesView
          ? categoryStats
          : levelStats
    });
    return;
  }

  const query: any = { isActive: true };

  // Apply filters
  if (category) query.category = { $regex: category, $options: 'i' };
  if (level) query.level = { $regex: level, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const skills = await Skill.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('projects', 'title images')
    .populate('certifications', 'name issuer');

  const total = await Skill.countDocuments(query);

  res.json({
    success: true,
    data: skills,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
export const getSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.findById(req.params.id)
    .populate('projects', 'title images technologies')
    .populate('certifications', 'name issuer issueDate');

  if (!skill || !skill.isActive) {
    throw new AppError('Skill not found', 404);
  }

  res.json({
    success: true,
    data: skill
  });
});

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private (Admin)
export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Skill created successfully',
    data: skill
  });
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  const updatedSkill = await Skill.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Skill updated successfully',
    data: updatedSkill
  });
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  await Skill.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Skill deleted successfully'
  });
});

// @desc    Get skills by category
// @route   GET /api/skills/category/:category
// @access  Public
export const getSkillsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;

  const skills = await Skill.find({
    category: { $regex: category, $options: 'i' },
    isActive: true
  }).sort({ name: 1 });

  res.json({
    success: true,
    data: skills
  });
});

// @desc    Get skills by level
// @route   GET /api/skills/level/:level
// @access  Public
export const getSkillsByLevel = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.params;

  const skills = await Skill.find({
    level: { $regex: level, $options: 'i' },
    isActive: true
  }).sort({ name: 1 });

  res.json({
    success: true,
    data: skills
  });
});

// @desc    Get skill categories
// @route   GET /api/skills/categories
// @access  Public
export const getSkillCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Skill.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get skill levels
// @route   GET /api/skills/levels
// @access  Public
export const getSkillLevels = asyncHandler(async (req: Request, res: Response) => {
  const levels = await Skill.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: levels
  });
});

// @desc    Get skill statistics
// @route   GET /api/skills/stats
// @access  Private (Admin)
export const getSkillStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Skill.aggregate([
    {
      $group: {
        _id: null,
        totalSkills: { $sum: 1 },
        activeSkills: {
          $sum: { $cond: ['$isActive', 1, 0] }
        }
      }
    }
  ]);

  const categoryStats = await Skill.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const levelStats = await Skill.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      categories: categoryStats,
      levels: levelStats
    }
  });
});

// @desc    Toggle skill active status
// @route   PATCH /api/skills/:id/toggle
// @access  Private (Admin)
export const toggleSkillStatus = asyncHandler(async (req: Request, res: Response) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new AppError('Skill not found', 404);
  }

  skill.isActive = !skill.isActive;
  await skill.save();

  res.json({
    success: true,
    message: `Skill ${skill.isActive ? 'activated' : 'deactivated'} successfully`,
    data: skill
  });
});
