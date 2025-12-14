import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import {
  PortfolioVisitor,
  PortfolioComment,
  PortfolioLike,
  NewsletterSubscriber,
  Project,
  Blog
} from '../models';

// @desc    Track page visit
// @route   POST /api/analytics/page-visits
// @access  Public
export const trackPageVisit = asyncHandler(async (req: Request, res: Response) => {
  const {
    sessionId,
    page,
    referrer,
    userAgent,
    ipAddress,
    country,
    city,
    device
  } = req.body;

  // Check if visitor exists
  let visitor = await PortfolioVisitor.findOne({ sessionId });

  if (visitor) {
    // Update existing visitor
    visitor.lastVisit = new Date();
    visitor.visitCount += 1;
    visitor.pagesVisited.push(page);
    visitor.sessionDuration = Date.now() - visitor.firstVisit.getTime();
    
    if (device) {
      visitor.device = device;
    }
    
    await visitor.save();
  } else {
    // Create new visitor
    visitor = await PortfolioVisitor.create({
      sessionId,
      ipAddress,
      userAgent,
      country,
      city,
      referrer,
      landingPage: page,
      pagesVisited: [page],
      sessionDuration: 0,
      isReturning: false,
      device: device || {},
      firstVisit: new Date(),
      lastVisit: new Date(),
      visitCount: 1
    });
  }

  res.json({
    success: true,
    message: 'Visit tracked successfully',
    data: {
      visitorId: visitor._id,
      isReturning: visitor.isReturning,
      visitCount: visitor.visitCount
    }
  });
});

// @desc    Like/Unlike content
// @route   POST /api/engagement/likes/:itemType/:itemId
// @access  Public
export const toggleContentLike = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.params;
  const { userId, sessionId, ipAddress, userAgent } = req.body;

  if (!['blog', 'project', 'comment'].includes(itemType)) {
    throw new AppError('Invalid item type', 400);
  }

  // Check if like already exists
  const existingLike = await PortfolioLike.findOne({
    itemId,
    itemType,
    $or: [
      { userId },
      { sessionId },
      { ipAddress }
    ]
  });

  let isLiked = false;
  let likesCount = 0;

  if (existingLike) {
    // Unlike
    await PortfolioLike.findByIdAndDelete(existingLike._id);
    isLiked = false;
  } else {
    // Like
    await PortfolioLike.create({
      userId,
      sessionId,
      itemId,
      itemType,
      ipAddress,
      userAgent
    });
    isLiked = true;
  }

  // Update likes count in the respective model
  const Model = (itemType === 'blog' ? Blog : itemType === 'project' ? Project : null) as Model<any> | null;
  
  if (Model) {
    const item = await Model.findById(itemId);
    if (item) {
      if (isLiked) {
        item.likes += 1;
      } else {
        item.likes = Math.max(0, item.likes - 1);
      }
      await item.save();
      likesCount = item.likes;
    }
  }

  res.json({
    success: true,
    message: isLiked ? 'Liked successfully' : 'Unliked successfully',
    data: {
      isLiked,
      likesCount
    }
  });
});

// @desc    Submit comment
// @route   POST /api/engagement/comments
// @access  Public
export const submitComment = asyncHandler(async (req: Request, res: Response) => {
  const {
    postId,
    postType,
    author,
    content,
    parentComment,
    ipAddress,
    userAgent
  } = req.body;

  if (!['blog', 'project'].includes(postType)) {
    throw new AppError('Invalid post type', 400);
  }

  // Verify post exists
  const Model = (postType === 'blog' ? Blog : Project) as Model<any>;
  const post = await Model.findById(postId);
  
  if (!post) {
    throw new AppError(`${postType} not found`, 404);
  }

  // Create comment
  const comment = await PortfolioComment.create({
    postId,
    postType,
    author: {
      name: author.name,
      email: author.email,
      website: author.website,
      avatar: author.avatar
    },
    content,
    parentComment,
    status: 'pending', // Comments need approval
    ipAddress,
    userAgent
  });

  // If it's a reply, add to parent comment's replies
  if (parentComment) {
    await PortfolioComment.findByIdAndUpdate(
      parentComment,
      { $push: { replies: comment._id } }
    );
  }

  res.json({
    success: true,
    message: 'Comment submitted successfully. It will be reviewed before publishing.',
    data: comment
  });
});

// @desc    Get comments for a post
// @route   GET /api/engagement/comments/:postType/:postId
// @access  Public
export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const { postType, postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await PortfolioComment.find({
    postId,
    postType,
    status: 'approved',
    parentComment: { $exists: false } // Only top-level comments
  })
    .populate('replies')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const totalComments = await PortfolioComment.countDocuments({
    postId,
    postType,
    status: 'approved'
  });

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(totalComments / parseInt(limit as string)),
        total: totalComments
      }
    }
  });
});

// @desc    Subscribe to newsletter
// @route   POST /api/communication/newsletter/subscribe
// @access  Public
export const subscribeToNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    firstName,
    lastName,
    preferences,
    source,
    ipAddress,
    userAgent
  } = req.body;

  // Check if already subscribed
  const existingSubscriber = await NewsletterSubscriber.findOne({ email });
  
  if (existingSubscriber) {
    if (existingSubscriber.status === 'subscribed') {
      throw new AppError('Email is already subscribed', 400);
    } else {
      // Reactivate subscription
      existingSubscriber.status = 'subscribed';
      existingSubscriber.firstName = firstName || existingSubscriber.firstName;
      existingSubscriber.lastName = lastName || existingSubscriber.lastName;
      existingSubscriber.preferences = preferences || existingSubscriber.preferences;
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = undefined;
      await existingSubscriber.save();
      
      res.json({
        success: true,
        message: 'Successfully resubscribed to newsletter',
        data: existingSubscriber
      });
      return;
    }
  }

  // Create new subscriber
  const subscriber = await NewsletterSubscriber.create({
    email,
    firstName,
    lastName,
    preferences: preferences || {
      frequency: 'weekly',
      categories: ['general']
    },
    source: source || 'website',
    ipAddress,
    userAgent,
    status: 'subscribed'
  });

  res.json({
    success: true,
    message: 'Successfully subscribed to newsletter',
    data: subscriber
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/communication/newsletter/unsubscribe
// @access  Public
export const unsubscribeFromNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const subscriber = await NewsletterSubscriber.findOne({ email });
  
  if (!subscriber) {
    throw new AppError('Email not found in subscribers list', 404);
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({
    success: true,
    message: 'Successfully unsubscribed from newsletter'
  });
});

// @desc    Get portfolio statistics (public)
// @route   GET /api/public/statistics
// @access  Public
export const getPublicStatistics = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalProjects,
    totalBlogs,
    totalComments,
    totalLikes,
    totalVisitors,
    featuredProjects,
    publishedBlogs
  ] = await Promise.all([
    Project.countDocuments({ archived: { $ne: true } }),
    Blog.countDocuments({ status: 'published' }),
    PortfolioComment.countDocuments({ status: 'approved' }),
    PortfolioLike.countDocuments(),
    PortfolioVisitor.countDocuments(),
    Project.countDocuments({ featured: true, archived: { $ne: true } }),
    Blog.countDocuments({ status: 'published', isFeatured: true })
  ]);

  // Get recent activity
  const recentProjects = await Project.find({ archived: { $ne: true } })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title createdAt');

  const recentBlogs = await Blog.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title publishedAt');

  res.json({
    success: true,
    data: {
      overview: {
        totalProjects,
        totalBlogs,
        totalComments,
        totalLikes,
        totalVisitors,
        featuredProjects,
        publishedBlogs
      },
      recent: {
        projects: recentProjects,
        blogs: recentBlogs
      }
    }
  });
});

// @desc    Search portfolio content
// @route   GET /api/public/search
// @access  Public
export const searchPortfolioContent = asyncHandler(async (req: Request, res: Response) => {
  const { q, type, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const searchRegex = new RegExp(q as string, 'i');
  const results: any = {
    projects: [],
    blogs: [],
    total: 0
  };

  // Search projects
  if (!type || type === 'projects') {
    const projects = await Project.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { technologies: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } }
      ],
      archived: { $ne: true }
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    results.projects = projects;
  }

  // Search blogs
  if (!type || type === 'blogs') {
    const blogs = await Blog.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex }
      ],
      status: 'published'
    })
      .sort({ isFeatured: -1, publishedAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    results.blogs = blogs;
  }

  // Calculate total results
  const projectCount = await Project.countDocuments({
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { technologies: { $in: [searchRegex] } },
      { tags: { $in: [searchRegex] } }
    ],
    archived: { $ne: true }
  });

  const blogCount = await Blog.countDocuments({
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { excerpt: searchRegex },
      { tags: { $in: [searchRegex] } },
      { category: searchRegex }
    ],
    status: 'published'
  });

  results.total = projectCount + blogCount;

  res.json({
    success: true,
    data: {
      results,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(results.total / parseInt(limit as string)),
        total: results.total
      },
      query: q
    }
  });
});

// @desc    Get related content
// @route   GET /api/public/content/related/:type/:id
// @access  Public
export const getRelatedContent = asyncHandler(async (req: Request, res: Response) => {
  const { type, id } = req.params;
  const { limit = 5 } = req.query;

  if (!['blog', 'project'].includes(type)) {
    throw new AppError('Invalid content type', 400);
  }

  const Model = (type === 'blog' ? Blog : Project) as Model<any>;
  const item = await Model.findById(id);

  if (!item) {
    throw new AppError(`${type} not found`, 404);
  }

  let relatedItems = [];

  if (type === 'blog') {
    // Find related blogs by category and tags
    relatedItems = await Blog.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { category: item.category },
        { tags: { $in: item.tags } }
      ]
    })
      .sort({ isFeatured: -1, publishedAt: -1 })
      .limit(parseInt(limit as string));
  } else {
    // Find related projects by technologies and tags
    relatedItems = await Project.find({
      _id: { $ne: id },
      archived: { $ne: true },
      $or: [
        { technologies: { $in: item.technologies } },
        { tags: { $in: item.tags } },
        { skills: { $in: item.skills } }
      ]
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit as string));
  }

  res.json({
    success: true,
    data: relatedItems
  });
});
