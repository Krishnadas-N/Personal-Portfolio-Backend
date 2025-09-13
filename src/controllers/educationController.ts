import { Request, Response } from 'express';
import Education from '../models/Education';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all education records
// @route   GET /api/education
// @access  Public
export const getEducation = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    current,
    degree,
    search,
    sort = 'startDate',
    order = 'desc'
  } = req.query;

  const query: any = {};

  // Apply filters
  if (current !== undefined) query.isCurrent = current === 'true';
  if (degree) query.degree = { $regex: degree, $options: 'i' };
  if (search) {
    query.$or = [
      { institution: { $regex: search, $options: 'i' } },
      { degree: { $regex: search, $options: 'i' } },
      { fieldOfStudy: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const education = await Education.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  const total = await Education.countDocuments(query);

  res.json({
    success: true,
    data: education,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single education record
// @route   GET /api/education/:id
// @access  Public
export const getEducationById = asyncHandler(async (req: Request, res: Response) => {
  const education = await Education.findById(req.params.id);

  if (!education) {
    throw new AppError('Education record not found', 404);
  }

  res.json({
    success: true,
    data: education
  });
});

// @desc    Create new education record
// @route   POST /api/education
// @access  Private (Admin)
export const createEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await Education.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Education record created successfully',
    data: education
  });
});

// @desc    Update education record
// @route   PUT /api/education/:id
// @access  Private (Admin)
export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await Education.findById(req.params.id);

  if (!education) {
    throw new AppError('Education record not found', 404);
  }

  const updatedEducation = await Education.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Education record updated successfully',
    data: updatedEducation
  });
});

// @desc    Delete education record
// @route   DELETE /api/education/:id
// @access  Private (Admin)
export const deleteEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await Education.findById(req.params.id);

  if (!education) {
    throw new AppError('Education record not found', 404);
  }

  await Education.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Education record deleted successfully'
  });
});

// @desc    Get current education
// @route   GET /api/education/current
// @access  Public
export const getCurrentEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await Education.find({ isCurrent: true })
    .sort({ startDate: -1 });

  res.json({
    success: true,
    data: education
  });
});

// @desc    Get education by institution
// @route   GET /api/education/institution/:institution
// @access  Public
export const getEducationByInstitution = asyncHandler(async (req: Request, res: Response) => {
  const { institution } = req.params;

  const education = await Education.find({
    institution: { $regex: institution, $options: 'i' }
  }).sort({ startDate: -1 });

  res.json({
    success: true,
    data: education
  });
});

// @desc    Get education statistics
// @route   GET /api/education/stats
// @access  Private (Admin)
export const getEducationStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Education.aggregate([
    {
      $group: {
        _id: null,
        totalEducation: { $sum: 1 },
        currentEducation: {
          $sum: { $cond: ['$isCurrent', 1, 0] }
        },
        totalInstitutions: { $addToSet: '$institution' }
      }
    },
    {
      $project: {
        totalEducation: 1,
        currentEducation: 1,
        uniqueInstitutions: { $size: '$totalInstitutions' }
      }
    }
  ]);

  const degreeStats = await Education.aggregate([
    { $group: { _id: '$degree', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const fieldStats = await Education.aggregate([
    { $group: { _id: '$fieldOfStudy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      degrees: degreeStats,
      fields: fieldStats
    }
  });
});
