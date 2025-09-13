import { Request, Response } from 'express';
import { PortfolioAnalytics, PortfolioVisitor, PortfolioComment, PortfolioLike } from '../models';

export class VisitorAnalyticsService {
  // Track page view
  static async trackPageView(req: Request, page: string) {
    try {
      const sessionId = req.sessionID || req.ip;
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      const referrer = req.get('Referer') || '';
      
      // Get or create visitor
      let visitor = await PortfolioVisitor.findOne({ sessionId });
      
      if (visitor) {
        visitor.lastVisit = new Date();
        visitor.visitCount += 1;
        visitor.pagesVisited.push(page);
        visitor.sessionDuration = Date.now() - visitor.firstVisit.getTime();
        await visitor.save();
      } else {
        visitor = await PortfolioVisitor.create({
          sessionId,
          ipAddress,
          userAgent,
          referrer,
          landingPage: page,
          pagesVisited: [page],
          sessionDuration: 0,
          isReturning: false,
          device: this.parseUserAgent(userAgent),
          firstVisit: new Date(),
          lastVisit: new Date(),
          visitCount: 1
        });
      }
      
      // Update daily analytics
      await this.updateDailyAnalytics(page);
      
      return visitor;
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Update daily analytics
  static async updateDailyAnalytics(page: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let analytics = await PortfolioAnalytics.findOne({ date: today });
      
      if (!analytics) {
        analytics = await PortfolioAnalytics.create({
          date: today,
          pageViews: 1,
          uniqueVisitors: 1,
          bounceRate: 0,
          avgSessionDuration: 0,
          topPages: [{ path: page, views: 1, title: page }],
          referrers: [],
          devices: [],
          countries: []
        });
      } else {
        analytics.pageViews += 1;
        
        // Update top pages
        const existingPage = analytics.topPages.find(p => p.path === page);
        if (existingPage) {
          existingPage.views += 1;
        } else {
          analytics.topPages.push({ path: page, views: 1, title: page });
        }
        
        // Sort and limit top pages
        analytics.topPages.sort((a, b) => b.views - a.views);
        analytics.topPages = analytics.topPages.slice(0, 10);
        
        await analytics.save();
      }
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  // Parse user agent to extract device info
  static parseUserAgent(userAgent: string) {
    const device = {
      type: 'desktop',
      os: 'unknown',
      browser: 'unknown'
    };

    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device.type = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detect OS
    if (/Windows/.test(userAgent)) device.os = 'Windows';
    else if (/Mac/.test(userAgent)) device.os = 'macOS';
    else if (/Linux/.test(userAgent)) device.os = 'Linux';
    else if (/Android/.test(userAgent)) device.os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) device.os = 'iOS';

    // Detect browser
    if (/Chrome/.test(userAgent)) device.browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) device.browser = 'Firefox';
    else if (/Safari/.test(userAgent)) device.browser = 'Safari';
    else if (/Edge/.test(userAgent)) device.browser = 'Edge';
    else if (/Opera/.test(userAgent)) device.browser = 'Opera';

    return device;
  }

  // Get analytics summary
  static async getAnalyticsSummary(period: string = '30d') {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const [
        analytics,
        visitors,
        comments,
        likes
      ] = await Promise.all([
        PortfolioAnalytics.find({ date: { $gte: startDate } }).sort({ date: -1 }),
        PortfolioVisitor.find({ firstVisit: { $gte: startDate } }),
        PortfolioComment.find({ createdAt: { $gte: startDate } }),
        PortfolioLike.find({ createdAt: { $gte: startDate } })
      ]);

      // Calculate metrics
      const totalPageViews = analytics.reduce((sum, a) => sum + a.pageViews, 0);
      const totalUniqueVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);
      const avgBounceRate = analytics.length > 0 ? 
        analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length : 0;
      const avgSessionDuration = analytics.length > 0 ?
        analytics.reduce((sum, a) => sum + a.avgSessionDuration, 0) / analytics.length : 0;

      // Device breakdown
      const deviceBreakdown = visitors.reduce((acc, visitor) => {
        const type = visitor.device?.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Country breakdown
      const countryBreakdown = visitors.reduce((acc, visitor) => {
        const country = visitor.country || 'unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Top pages
      const topPages = analytics.reduce((acc, dayAnalytics) => {
        dayAnalytics.topPages.forEach(page => {
          const existing = acc.find(p => p.path === page.path);
          if (existing) {
            existing.views += page.views;
          } else {
            acc.push({ ...page });
          }
        });
        return acc;
      }, [] as any[]);

      topPages.sort((a, b) => b.views - a.views);

      return {
        period,
        totalPageViews,
        totalUniqueVisitors,
        avgBounceRate,
        avgSessionDuration,
        totalComments: comments.length,
        totalLikes: likes.length,
        deviceBreakdown,
        countryBreakdown,
        topPages: topPages.slice(0, 10),
        dailyData: analytics
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      throw error;
    }
  }

  // Get real-time analytics
  static async getRealTimeAnalytics() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const [
        activeVisitors,
        recentComments,
        recentLikes,
        todayStats
      ] = await Promise.all([
        PortfolioVisitor.find({ lastVisit: { $gte: oneHourAgo } }),
        PortfolioComment.find({ createdAt: { $gte: oneHourAgo } }),
        PortfolioLike.find({ createdAt: { $gte: oneHourAgo } }),
        PortfolioAnalytics.findOne({ 
          date: { 
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        })
      ]);

      return {
        activeVisitors: activeVisitors.length,
        recentComments: recentComments.length,
        recentLikes: recentLikes.length,
        todayPageViews: todayStats?.pageViews || 0,
        todayUniqueVisitors: todayStats?.uniqueVisitors || 0,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      throw error;
    }
  }

  // Generate analytics report
  static async generateAnalyticsReport(startDate: Date, endDate: Date) {
    try {
      const analytics = await PortfolioAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const visitors = await PortfolioVisitor.find({
        firstVisit: { $gte: startDate, $lte: endDate }
      });

      const comments = await PortfolioComment.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const likes = await PortfolioLike.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // Calculate growth metrics
      const totalPageViews = analytics.reduce((sum, a) => sum + a.pageViews, 0);
      const totalUniqueVisitors = analytics.reduce((sum, a) => sum + a.uniqueVisitors, 0);
      const avgBounceRate = analytics.length > 0 ? 
        analytics.reduce((sum, a) => sum + a.bounceRate, 0) / analytics.length : 0;
      const avgSessionDuration = analytics.length > 0 ?
        analytics.reduce((sum, a) => sum + a.avgSessionDuration, 0) / analytics.length : 0;

      // Engagement metrics
      const engagementRate = totalUniqueVisitors > 0 ? 
        ((comments.length + likes.length) / totalUniqueVisitors) * 100 : 0;

      // Top content
      const topPages = analytics.reduce((acc, dayAnalytics) => {
        dayAnalytics.topPages.forEach(page => {
          const existing = acc.find(p => p.path === page.path);
          if (existing) {
            existing.views += page.views;
          } else {
            acc.push({ ...page });
          }
        });
        return acc;
      }, [] as any[]);

      topPages.sort((a, b) => b.views - a.views);

      return {
        period: {
          startDate,
          endDate,
          days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        metrics: {
          totalPageViews,
          totalUniqueVisitors,
          avgBounceRate,
          avgSessionDuration,
          totalComments: comments.length,
          totalLikes: likes.length,
          engagementRate
        },
        topPages: topPages.slice(0, 10),
        dailyData: analytics,
        summary: {
          avgDailyPageViews: totalPageViews / analytics.length,
          avgDailyVisitors: totalUniqueVisitors / analytics.length,
          peakDay: analytics.reduce((peak, day) => 
            day.pageViews > peak.pageViews ? day : peak, analytics[0] || { pageViews: 0 })
        }
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }
}

export default VisitorAnalyticsService;
