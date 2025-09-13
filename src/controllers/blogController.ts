import { Request, Response } from 'express';
import Blog from '../models/Blog';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    status = 'published',
    search,
    featured,
    sort = 'publishedAt',
    order = 'desc'
  } = req.query;

  const query: any = { status };

  // Apply filters
  if (category) query.category = category;
  if (featured !== undefined) query.isFeatured = featured === 'true';
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sortObj: any = {};
  sortObj[sort as string] = order === 'desc' ? -1 : 1;

  const blogs = await Blog.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .populate('author', 'name email')
    .populate('relatedPosts', 'title slug');

  const total = await Blog.countDocuments(query);

  res.json({
    success: true,
    data: blogs,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit)
    }
  });
});

// @desc    Get single blog
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'name email')
    .populate('relatedPosts', 'title slug excerpt');

  if (!blog || blog.status !== 'published') {
    throw new AppError('Blog post not found', 404);
  }

  // Increment view count
  blog.viewsCount += 1;
  await blog.save();

  res.json({
    success: true,
    data: blog
  });
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin)
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const blogData = {
    ...req.body,
    author: req.user?.id || req.admin?.id
  };

  const blog = await Blog.create(blogData);

  res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    data: blog
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Blog post updated successfully',
    data: updatedBlog
  });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
});

// @desc    Publish blog
// @route   PATCH /api/blogs/:id/publish
// @access  Private (Admin)
export const publishBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  blog.status = 'published';
  blog.publishedAt = new Date();
  await blog.save();

  res.json({
    success: true,
    message: 'Blog post published successfully',
    data: blog
  });
});

// @desc    Like blog
// @route   POST /api/blogs/:id/like
// @access  Public
export const likeBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  blog.likes += 1;
  await blog.save();

  res.json({
    success: true,
    message: 'Blog post liked successfully',
    data: { likes: blog.likes }
  });
});

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
export const getFeaturedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 3 } = req.query;

  const blogs = await Blog.find({
    isFeatured: true,
    status: 'published'
  })
    .sort({ publishedAt: -1 })
    .limit(Number(limit))
    .select('title excerpt slug featuredImage publishedAt readingTime');

  res.json({
    success: true,
    data: blogs
  });
});

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
export const getBlogsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const blogs = await Blog.find({
    category: { $regex: category, $options: 'i' },
    status: 'published'
  })
    .sort({ publishedAt: -1 })
    .limit(Number(limit))
    .select('title excerpt slug featuredImage publishedAt readingTime');

  res.json({
    success: true,
    data: blogs
  });
});

// @desc    Get blog categories
// @route   GET /api/blogs/categories
// @access  Public
export const getBlogCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get blog statistics
// @route   GET /api/blogs/stats
// @access  Private (Admin)
export const getBlogStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Blog.aggregate([
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalViews: { $sum: '$viewsCount' },
        totalLikes: { $sum: '$likes' },
        featuredBlogs: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        }
      }
    }
  ]);

  const categoryStats = await Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      topCategories: categoryStats
    }
  });
});
