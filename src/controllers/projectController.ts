import { Request, Response } from 'express';
import Project from '../models/Project';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    status, 
    featured, 
    search,
    sort = 'createdAt',
    order = 'desc'
  } = req.query;

  const query: any = { archived: { $ne: true } };

  // Apply filters
  if (type) query.projectType = type;
  if (status) query.status = status;
  if (featured !== undefined) query.featured = featured === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { technologies: { $in: [new RegExp(search as string, 'i')] } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const projects = await Project.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('relatedProjects', 'title images');

  const total = await Project.countDocuments(query);

  res.json({
    success: true,
    data: projects,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id)
    .populate('relatedProjects', 'title images technologies');

  if (!project || project.archived) {
    throw new AppError('Project not found', 404);
  }

  // Increment view count
  project.viewsCount += 1;
  await project.save();

  res.json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const projectData = {
    ...req.body,
    lastUpdatedBy: req.user?.id || req.admin?.id
  };

  const project = await Project.create(projectData);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      lastUpdatedBy: req.user?.id || req.admin?.id
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updatedProject
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await Project.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Archive project
// @route   PATCH /api/projects/:id/archive
// @access  Private (Admin)
export const archiveProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  project.archived = true;
  project.lastUpdatedBy = req.user?.id || req.admin?.id;
  await project.save();

  res.json({
    success: true,
    message: 'Project archived successfully',
    data: project
  });
});

// @desc    Like project
// @route   POST /api/projects/:id/like
// @access  Public
export const likeProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  project.likes += 1;
  await project.save();

  res.json({
    success: true,
    message: 'Project liked successfully',
    data: { likes: project.likes }
  });
});

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
export const getFeaturedProjects = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 6 } = req.query;

  const projects = await Project.find({
    featured: true,
    archived: { $ne: true }
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('title description images technologies projectType');

  res.json({
    success: true,
    data: projects
  });
});

// @desc    Get projects by technology
// @route   GET /api/projects/technology/:tech
// @access  Public
export const getProjectsByTechnology = asyncHandler(async (req: Request, res: Response) => {
  const { tech } = req.params;
  const { limit = 10 } = req.query;

  const projects = await Project.find({
    technologies: { $regex: tech, $options: 'i' },
    archived: { $ne: true }
  })
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({
    success: true,
    data: projects
  });
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private (Admin)
export const getProjectStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Project.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        totalViews: { $sum: '$viewsCount' },
        totalLikes: { $sum: '$likes' },
        featuredProjects: {
          $sum: { $cond: ['$featured', 1, 0] }
        },
        activeProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
        },
        completedProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        }
      }
    }
  ]);

  const technologyStats = await Project.aggregate([
    { $unwind: '$technologies' },
    { $group: { _id: '$technologies', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      topTechnologies: technologyStats
    }
  });
});
