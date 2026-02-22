import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    featured,
    verified,
    company,
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const query: any = { isActive: true };

  // Apply filters
  if (featured !== undefined) query.isFeatured = featured === 'true';
  if (verified !== undefined) query.verified = verified === 'true';
  if (company) query.clientCompany = { $regex: company, $options: 'i' };
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { clientCompany: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const testimonials = await Testimonial.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('project', 'title images');

  const total = await Testimonial.countDocuments(query);

  res.json({
    success: true,
    data: testimonials,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id)
    .populate('project', 'title images technologies');

  if (!testimonial || !testimonial.isActive) {
    throw new AppError('Testimonial not found', 404);
  }

  res.json({
    success: true,
    data: testimonial
  });
});

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private (Admin)
export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Testimonial created successfully',
    data: testimonial
  });
});

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private (Admin)
export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  const updatedTestimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Testimonial updated successfully',
    data: updatedTestimonial
  });
});

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  await Testimonial.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Testimonial deleted successfully'
  });
});

// @desc    Get featured testimonials
// @route   GET /api/testimonials/featured
// @access  Public
export const getFeaturedTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 6 } = req.query;

  const testimonials = await Testimonial.find({
    isFeatured: true,
    isActive: true,
    verified: true
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('project', 'title images')
    .select('clientName clientPosition clientCompany content rating clientImage');

  res.json({
    success: true,
    data: testimonials
  });
});

// @desc    Get verified testimonials
// @route   GET /api/testimonials/verified
// @access  Public
export const getVerifiedTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  const testimonials = await Testimonial.find({
    verified: true,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('project', 'title images');

  res.json({
    success: true,
    data: testimonials
  });
});

// @desc    Verify testimonial
// @route   PATCH /api/testimonials/:id/verify
// @access  Private (Admin)
export const verifyTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  testimonial.verified = true;
  testimonial.verifiedAt = new Date();
  await testimonial.save();

  res.json({
    success: true,
    message: 'Testimonial verified successfully',
    data: testimonial
  });
});

// @desc    Feature testimonial
// @route   PATCH /api/testimonials/:id/feature
// @access  Private (Admin)
export const featureTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  testimonial.isFeatured = !testimonial.isFeatured;
  await testimonial.save();

  res.json({
    success: true,
    message: `Testimonial ${testimonial.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    data: testimonial
  });
});

// @desc    Get testimonials by company
// @route   GET /api/testimonials/company/:company
// @access  Public
export const getTestimonialsByCompany = asyncHandler(async (req: Request, res: Response) => {
  const { company } = req.params;

  const testimonials = await Testimonial.find({
    clientCompany: { $regex: company, $options: 'i' },
    isActive: true,
    verified: true
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: testimonials
  });
});

// @desc    Get testimonial statistics
// @route   GET /api/testimonials/stats
// @access  Private (Admin)
export const getTestimonialStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Testimonial.aggregate([
    {
      $group: {
        _id: null,
        totalTestimonials: { $sum: 1 },
        activeTestimonials: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        verifiedTestimonials: {
          $sum: { $cond: ['$verified', 1, 0] }
        },
        featuredTestimonials: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        },
        averageRating: { $avg: '$rating' },
        totalCompanies: { $addToSet: '$clientCompany' }
      }
    },
    {
      $project: {
        totalTestimonials: 1,
        activeTestimonials: 1,
        verifiedTestimonials: 1,
        featuredTestimonials: 1,
        averageRating: { $round: ['$averageRating', 2] },
        uniqueCompanies: { $size: '$totalCompanies' }
      }
    }
  ]);

  const ratingStats = await Testimonial.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  const companyStats = await Testimonial.aggregate([
    { $match: { isActive: true, verified: true } },
    { $group: { _id: '$clientCompany', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      ratings: ratingStats,
      topCompanies: companyStats
    }
  });
});

// @desc    Toggle testimonial active status
// @route   PATCH /api/testimonials/:id/toggle
// @access  Private (Admin)
export const toggleTestimonialStatus = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    throw new AppError('Testimonial not found', 404);
  }

  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();

  res.json({
    success: true,
    message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`,
    data: testimonial
  });
});
