import { Request, Response } from 'express';
import Experience from '../models/Experience';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
export const getExperiences = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    current,
    employmentType,
    search,
    sort = 'startDate',
    order = 'desc'
  } = req.query;

  const query: any = {};

  // Apply filters
  if (current !== undefined) query.isCurrent = current === 'true';
  if (employmentType) query.employmentType = employmentType;
  if (search) {
    query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const experiences = await Experience.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  const total = await Experience.countDocuments(query);

  res.json({
    success: true,
    data: experiences,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single experience
// @route   GET /api/experiences/:id
// @access  Public
export const getExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    throw new AppError('Experience not found', 404);
  }

  res.json({
    success: true,
    data: experience
  });
});

// @desc    Create new experience
// @route   POST /api/experiences
// @access  Private (Admin)
export const createExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await Experience.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Experience created successfully',
    data: experience
  });
});

// @desc    Update experience
// @route   PUT /api/experiences/:id
// @access  Private (Admin)
export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    throw new AppError('Experience not found', 404);
  }

  const updatedExperience = await Experience.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Experience updated successfully',
    data: updatedExperience
  });
});

// @desc    Delete experience
// @route   DELETE /api/experiences/:id
// @access  Private (Admin)
export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    throw new AppError('Experience not found', 404);
  }

  await Experience.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Experience deleted successfully'
  });
});

// @desc    Get current experiences
// @route   GET /api/experiences/current
// @access  Public
export const getCurrentExperiences = asyncHandler(async (req: Request, res: Response) => {
  const experiences = await Experience.find({ isCurrent: true })
    .sort({ startDate: -1 });

  res.json({
    success: true,
    data: experiences
  });
});

// @desc    Get experiences by company
// @route   GET /api/experiences/company/:company
// @access  Public
export const getExperiencesByCompany = asyncHandler(async (req: Request, res: Response) => {
  const { company } = req.params;

  const experiences = await Experience.find({
    company: { $regex: company, $options: 'i' }
  }).sort({ startDate: -1 });

  res.json({
    success: true,
    data: experiences
  });
});

// @desc    Get experience statistics
// @route   GET /api/experiences/stats
// @access  Private (Admin)
export const getExperienceStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Experience.aggregate([
    {
      $group: {
        _id: null,
        totalExperiences: { $sum: 1 },
        currentExperiences: {
          $sum: { $cond: ['$isCurrent', 1, 0] }
        },
        totalCompanies: { $addToSet: '$company' }
      }
    },
    {
      $project: {
        totalExperiences: 1,
        currentExperiences: 1,
        uniqueCompanies: { $size: '$totalCompanies' }
      }
    }
  ]);

  const employmentTypeStats = await Experience.aggregate([
    { $group: { _id: '$employmentType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const industryStats = await Experience.aggregate([
    { $match: { industry: { $exists: true, $ne: null } } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      employmentTypes: employmentTypeStats,
      industries: industryStats
    }
  });
});
