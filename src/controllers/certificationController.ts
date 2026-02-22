import { Request, Response } from 'express';
import Certification from '../models/Certification';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
export const getCertifications = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    category,
    level,
    issuer,
    search,
    recent,
    sort = 'issueDate',
    order = 'desc'
  } = req.query;

  const query: any = { isActive: true };
  const pageNum = Math.max(Number(page) || 1, 1);
  const requestedLimit = Math.max(Number(limit) || 10, 1);

  // Apply filters
  if (category) query.category = { $regex: category, $options: 'i' };
  if (level) query.level = level;
  if (issuer) query.issuer = { $regex: issuer, $options: 'i' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { issuer: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const isRecent = recent === 'true' || recent === '1';
  const effectiveLimit = isRecent && req.query.limit === undefined ? 5 : requestedLimit;
  const skip = (pageNum - 1) * effectiveLimit;

  let certificationsQuery = Certification.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(effectiveLimit);

  if (isRecent) {
    certificationsQuery = certificationsQuery.select('name issuer issueDate badgeImage');
  }

  const certifications = await certificationsQuery;

  const total = await Certification.countDocuments(query);

  res.json({
    success: true,
    data: certifications,
    pagination: {
      current: pageNum,
      pages: Math.ceil(total / effectiveLimit),
      total,
      limit: effectiveLimit
    }
  });
});

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Public
export const getCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification || !certification.isActive) {
    throw new AppError('Certification not found', 404);
  }

  res.json({
    success: true,
    data: certification
  });
});

// @desc    Create new certification
// @route   POST /api/certifications
// @access  Private (Admin)
export const createCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await Certification.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Certification created successfully',
    data: certification
  });
});

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private (Admin)
export const updateCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    throw new AppError('Certification not found', 404);
  }

  const updatedCertification = await Certification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Certification updated successfully',
    data: updatedCertification
  });
});

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private (Admin)
export const deleteCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    throw new AppError('Certification not found', 404);
  }

  await Certification.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Certification deleted successfully'
  });
});

// @desc    Get certifications by issuer
// @route   GET /api/certifications/issuer/:issuer
// @access  Public
export const getCertificationsByIssuer = asyncHandler(async (req: Request, res: Response) => {
  const { issuer } = req.params;

  const certifications = await Certification.find({
    issuer: { $regex: issuer, $options: 'i' },
    isActive: true
  }).sort({ issueDate: -1 });

  res.json({
    success: true,
    data: certifications
  });
});

// @desc    Get certifications by category
// @route   GET /api/certifications/category/:category
// @access  Public
export const getCertificationsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;

  const certifications = await Certification.find({
    category: { $regex: category, $options: 'i' },
    isActive: true
  }).sort({ issueDate: -1 });

  res.json({
    success: true,
    data: certifications
  });
});

// @desc    Get recent certifications
// @route   GET /api/certifications/recent
// @access  Public
export const getRecentCertifications = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 5 } = req.query;

  const certifications = await Certification.find({
    isActive: true
  })
    .sort({ issueDate: -1 })
    .limit(Number(limit))
    .select('name issuer issueDate badgeImage');

  res.json({
    success: true,
    data: certifications
  });
});

// @desc    Get certification statistics
// @route   GET /api/certifications/stats
// @access  Private (Admin)
export const getCertificationStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Certification.aggregate([
    {
      $group: {
        _id: null,
        totalCertifications: { $sum: 1 },
        activeCertifications: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalIssuers: { $addToSet: '$issuer' }
      }
    },
    {
      $project: {
        totalCertifications: 1,
        activeCertifications: 1,
        uniqueIssuers: { $size: '$totalIssuers' }
      }
    }
  ]);

  const issuerStats = await Certification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$issuer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const categoryStats = await Certification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const levelStats = await Certification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      issuers: issuerStats,
      categories: categoryStats,
      levels: levelStats
    }
  });
});

// @desc    Toggle certification active status
// @route   PATCH /api/certifications/:id/toggle
// @access  Private (Admin)
export const toggleCertificationStatus = asyncHandler(async (req: Request, res: Response) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    throw new AppError('Certification not found', 404);
  }

  certification.isActive = !certification.isActive;
  await certification.save();

  res.json({
    success: true,
    message: `Certification ${certification.isActive ? 'activated' : 'deactivated'} successfully`,
    data: certification
  });
});
