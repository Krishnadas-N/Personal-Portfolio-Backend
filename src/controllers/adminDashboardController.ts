import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import {
  PortfolioAnalytics,
  PortfolioSettings,
  NewsletterSubscriber,
  NewsletterCampaign,
  PortfolioVisitor,
  PortfolioComment,
  PortfolioLike,
  Project,
  Blog,
  Contact,
  User
} from '../models';

// @desc    Get comprehensive admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const [
    // Basic stats
    totalUsers,
    totalContacts,
    totalProjects,
    totalBlogs,
    
    // New portfolio stats
    totalVisitors,
    totalComments,
    totalNewsletterSubscribers,
    totalNewsletterCampaigns,
    
    // Recent activity
    recentContacts,
    recentProjects,
    recentBlogs,
    recentVisitors,
    recentComments,
    
    // Analytics data
    todayAnalytics,
    weeklyAnalytics,
    monthlyAnalytics,
    
    // Top content
    topProjects,
    topBlogs,
    topPages
  ] = await Promise.all([
    // Basic counts
    User.countDocuments(),
    Contact.countDocuments(),
    Project.countDocuments(),
    Blog.countDocuments(),
    
    // New portfolio counts
    PortfolioVisitor.countDocuments(),
    PortfolioComment.countDocuments(),
    NewsletterSubscriber.countDocuments({ status: 'subscribed' }),
    NewsletterCampaign.countDocuments(),
    
    // Recent activity
    Contact.find().sort({ createdAt: -1 }).limit(5).select('name email subject status createdAt'),
    Project.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt viewsCount'),
    Blog.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt viewsCount'),
    PortfolioVisitor.find().sort({ lastVisit: -1 }).limit(5).select('ipAddress country landingPage lastVisit'),
    PortfolioComment.find().sort({ createdAt: -1 }).limit(5).select('author content status createdAt'),
    
    // Analytics data
    PortfolioAnalytics.findOne({ date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    PortfolioAnalytics.find({ 
      date: { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        $lt: new Date()
      }
    }).sort({ date: -1 }),
    PortfolioAnalytics.find({ 
      date: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lt: new Date()
      }
    }).sort({ date: -1 }),
    
    // Top content
    Project.find({ featured: true }).sort({ viewsCount: -1 }).limit(3).select('title viewsCount likes'),
    Blog.find({ status: 'published' }).sort({ viewsCount: -1 }).limit(3).select('title viewsCount likes'),
    PortfolioAnalytics.aggregate([
      { $unwind: '$topPages' },
      { $group: { _id: '$topPages.path', totalViews: { $sum: '$topPages.views' } } },
      { $sort: { totalViews: -1 } },
      { $limit: 5 }
    ])
  ]);

  // Calculate growth metrics
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    lastWeekVisitors,
    lastMonthVisitors,
    lastWeekComments,
    lastMonthComments
  ] = await Promise.all([
    PortfolioVisitor.countDocuments({ firstVisit: { $gte: lastWeek } }),
    PortfolioVisitor.countDocuments({ firstVisit: { $gte: lastMonth } }),
    PortfolioComment.countDocuments({ createdAt: { $gte: lastWeek } }),
    PortfolioComment.countDocuments({ createdAt: { $gte: lastMonth } })
  ]);

  // Calculate visitor growth
  const visitorGrowth = {
    weekly: totalVisitors > 0 ? ((lastWeekVisitors / totalVisitors) * 100).toFixed(1) : '0',
    monthly: totalVisitors > 0 ? ((lastMonthVisitors / totalVisitors) * 100).toFixed(1) : '0'
  };

  // Calculate comment growth
  const commentGrowth = {
    weekly: totalComments > 0 ? ((lastWeekComments / totalComments) * 100).toFixed(1) : '0',
    monthly: totalComments > 0 ? ((lastMonthComments / totalComments) * 100).toFixed(1) : '0'
  };

  // Get device and country stats
  const deviceStats = await PortfolioVisitor.aggregate([
    { $group: { _id: '$device.type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const countryStats = await PortfolioVisitor.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalContacts,
        totalProjects,
        totalBlogs,
        totalVisitors,
        totalComments,
        totalNewsletterSubscribers,
        totalNewsletterCampaigns
      },
      growth: {
        visitors: visitorGrowth,
        comments: commentGrowth
      },
      analytics: {
        today: todayAnalytics,
        weekly: weeklyAnalytics,
        monthly: monthlyAnalytics
      },
      topContent: {
        projects: topProjects,
        blogs: topBlogs,
        pages: topPages
      },
      demographics: {
        devices: deviceStats,
        countries: countryStats
      },
      recent: {
        contacts: recentContacts,
        projects: recentProjects,
        blogs: recentBlogs,
        visitors: recentVisitors,
        comments: recentComments
      }
    }
  });
});

// @desc    Get portfolio settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getPortfolioSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await PortfolioSettings.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = await PortfolioSettings.create({
      siteName: "My Portfolio",
      siteDescription: "A modern portfolio website",
      siteKeywords: ["portfolio", "developer", "web development"],
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
        accentColor: "#F59E0B",
        fontFamily: "Inter",
        darkMode: false
      },
      features: {
        blog: true,
        projects: true,
        testimonials: true,
        contact: true,
        analytics: true,
        chatBot: true,
        newsletter: false
      }
    });
  }

  res.json({
    success: true,
    data: settings
  });
});

// @desc    Update portfolio settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updatePortfolioSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await PortfolioSettings.findOneAndUpdate(
    {},
    req.body,
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Portfolio settings updated successfully',
    data: settings
  });
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { period = '30d', startDate, endDate } = req.query;
  
  let dateFilter: any = {};
  
  if (startDate && endDate) {
    dateFilter = {
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    };
  } else {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    dateFilter = {
      date: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };
  }

  const analytics = await PortfolioAnalytics.find(dateFilter).sort({ date: -1 });
  
  // Calculate aggregated metrics
  const aggregatedMetrics = analytics.reduce((acc, data) => {
    acc.totalPageViews += data.pageViews;
    acc.totalUniqueVisitors += data.uniqueVisitors;
    acc.totalBounceRate += data.bounceRate;
    acc.totalSessionDuration += data.avgSessionDuration;
    return acc;
  }, {
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalBounceRate: 0,
    totalSessionDuration: 0
  });

  const avgMetrics = {
    avgPageViews: analytics.length > 0 ? aggregatedMetrics.totalPageViews / analytics.length : 0,
    avgUniqueVisitors: analytics.length > 0 ? aggregatedMetrics.totalUniqueVisitors / analytics.length : 0,
    avgBounceRate: analytics.length > 0 ? aggregatedMetrics.totalBounceRate / analytics.length : 0,
    avgSessionDuration: analytics.length > 0 ? aggregatedMetrics.totalSessionDuration / analytics.length : 0
  };

  res.json({
    success: true,
    data: {
      analytics,
      metrics: avgMetrics,
      period,
      totalDays: analytics.length
    }
  });
});

// @desc    Get visitor insights
// @route   GET /api/admin/visitors
// @access  Private (Admin)
export const getVisitorInsights = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, country, device, isReturning } = req.query;
  
  const filter: any = {};
  if (country) filter.country = country;
  if (device) filter['device.type'] = device;
  if (isReturning !== undefined) filter.isReturning = isReturning === 'true';

  const visitors = await PortfolioVisitor.find(filter)
    .sort({ lastVisit: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string))
    .select('-userAgent');

  const totalVisitors = await PortfolioVisitor.countDocuments(filter);

  // Get visitor statistics
  const stats = await PortfolioVisitor.aggregate([
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: 1 },
        returningVisitors: { $sum: { $cond: ['$isReturning', 1, 0] } },
        avgSessionDuration: { $avg: '$sessionDuration' },
        avgVisitCount: { $avg: '$visitCount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      visitors,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(totalVisitors / parseInt(limit as string)),
        total: totalVisitors
      },
      stats: stats[0] || {
        totalVisitors: 0,
        returningVisitors: 0,
        avgSessionDuration: 0,
        avgVisitCount: 0
      }
    }
  });
});

// @desc    Get newsletter subscribers
// @route   GET /api/admin/newsletter/subscribers
// @access  Private (Admin)
export const getNewsletterSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  const filter: any = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }

  const subscribers = await NewsletterSubscriber.find(filter)
    .sort({ subscribedAt: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const totalSubscribers = await NewsletterSubscriber.countDocuments(filter);

  // Get subscriber statistics
  const stats = await NewsletterSubscriber.aggregate([
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
      subscribers,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(totalSubscribers / parseInt(limit as string)),
        total: totalSubscribers
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as { [key: string]: number })
    }
  });
});

// @desc    Get newsletter campaigns
// @route   GET /api/admin/newsletter/campaigns
// @access  Private (Admin)
export const getNewsletterCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status } = req.query;
  
  const filter: any = {};
  if (status) filter.status = status;

  const campaigns = await NewsletterCampaign.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const totalCampaigns = await NewsletterCampaign.countDocuments(filter);

  res.json({
    success: true,
    data: {
      campaigns,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(totalCampaigns / parseInt(limit as string)),
        total: totalCampaigns
      }
    }
  });
});

// @desc    Get comments management
// @route   GET /api/admin/comments
// @access  Private (Admin)
export const getCommentsManagement = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, postType, postId } = req.query;
  
  const filter: any = {};
  if (status) filter.status = status;
  if (postType) filter.postType = postType;
  if (postId) filter.postId = postId;

  const comments = await PortfolioComment.find(filter)
    .populate('postId', 'title')
    .populate('parentComment', 'content')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string) * 1)
    .skip((parseInt(page as string) - 1) * parseInt(limit as string));

  const totalComments = await PortfolioComment.countDocuments(filter);

  // Get comment statistics
  const stats = await PortfolioComment.aggregate([
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
      comments,
      pagination: {
        current: parseInt(page as string),
        pages: Math.ceil(totalComments / parseInt(limit as string)),
        total: totalComments
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as { [key: string]: number })
    }
  });
});

// @desc    Update comment status
// @route   PATCH /api/admin/comments/:id/status
// @access  Private (Admin)
export const updateCommentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const comment = await PortfolioComment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  res.json({
    success: true,
    message: 'Comment status updated successfully',
    data: comment
  });
});

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin)
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const comment = await PortfolioComment.findByIdAndDelete(id);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});
