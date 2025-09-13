import { Request, Response, NextFunction } from 'express';
import VisitorAnalyticsService from '../services/visitorAnalyticsService';
import CommunicationService from '../services/communicationService';

// Analytics tracking middleware
export const trackPageAnalytics = (req: Request, res: Response, next: NextFunction) => {
  // Skip tracking for admin routes and API routes
  if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
    return next();
  }

  // Track page view asynchronously
  setImmediate(async () => {
    try {
      const page = req.path;
      await VisitorAnalyticsService.trackPageView(req, page);
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  });

  next();
};

// Enhanced error tracking middleware
export const trackErrorMetrics = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Track 4xx and 5xx errors
    if (res.statusCode >= 400) {
      setImmediate(async () => {
        try {
          await CommunicationService.sendSystemAlert(
            `HTTP ${res.statusCode} Error`,
            `Error occurred on ${req.method} ${req.path}: ${res.statusMessage}`,
            res.statusCode >= 500 ? 'high' : 'medium'
          );
        } catch (error) {
          console.error('Error tracking error:', error);
        }
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Performance monitoring middleware
export const trackPerformanceMetrics = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 5000) { // 5 seconds
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
      
      setImmediate(async () => {
        try {
          await CommunicationService.sendSystemAlert(
            'Slow Request Detected',
            `${req.method} ${req.path} took ${duration}ms to complete`,
            'medium'
          );
        } catch (error) {
          console.error('Error tracking slow request:', error);
        }
      });
    }
  });
  
  next();
};

// Security monitoring middleware
export const trackSecurityMetrics = (req: Request, res: Response, next: NextFunction) => {
  // Track suspicious activity
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
    /javascript:/i // JavaScript injection
  ];
  
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  const body = JSON.stringify(req.body);
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    setImmediate(async () => {
      try {
        await CommunicationService.sendSystemAlert(
          'Suspicious Activity Detected',
          `Suspicious request from ${req.ip}: ${req.method} ${req.path}`,
          'high'
        );
      } catch (error) {
        console.error('Error tracking suspicious activity:', error);
      }
    });
  }
  
  next();
};

// Rate limiting tracking middleware
export const trackRateLimitMetrics = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  
  // Track rate limit hits
  res.on('finish', () => {
    if (res.statusCode === 429) { // Too Many Requests
      setImmediate(async () => {
        try {
          await CommunicationService.sendSystemAlert(
            'Rate Limit Exceeded',
            `Rate limit exceeded for IP ${ip} on ${req.method} ${req.path}`,
            'medium'
          );
        } catch (error) {
          console.error('Error tracking rate limit:', error);
        }
      });
    }
  });
  
  next();
};

// Content engagement tracking middleware
export const trackUserEngagement = (req: Request, res: Response, next: NextFunction) => {
  // Track time spent on page (client-side)
  if (req.path.startsWith('/projects/') || req.path.startsWith('/blogs/')) {
    // Add tracking script to response
    const originalSend = res.send;
    
    res.send = function(data) {
      if (typeof data === 'string' && data.includes('</body>')) {
        const trackingScript = `
          <script>
            // Track time spent on page
            let startTime = Date.now();
            let timeSpent = 0;
            
            window.addEventListener('beforeunload', function() {
              timeSpent = Date.now() - startTime;
              if (timeSpent > 1000) { // Only track if spent more than 1 second
                fetch('/api/analytics/page-visits', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    page: '${req.path}',
                    timeSpent: timeSpent,
                    sessionId: '${req.sessionID}'
                  })
                }).catch(console.error);
              }
            });
          </script>
        `;
        
        data = data.replace('</body>', trackingScript + '</body>');
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
};

// Bot detection middleware
export const detectBotTraffic = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  if (isBot) {
    req.isBot = true;
    console.log(`Bot detected: ${userAgent}`);
  } else {
    req.isBot = false;
  }
  
  next();
};

// Geographic tracking middleware
export const trackGeographicData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically use a service like MaxMind GeoIP2
    // For now, we'll use a simple approach
    const ip = req.ip;
    
    // Mock geographic data (replace with real GeoIP service)
    req.geoData = {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC'
    };
    
    next();
  } catch (error) {
    console.error('Error tracking geography:', error);
    next();
  }
};

// Export all middleware
export const analyticsMiddleware = {
  trackPageAnalytics,
  trackErrorMetrics,
  trackPerformanceMetrics,
  trackSecurityMetrics,
  trackRateLimitMetrics,
  trackUserEngagement,
  detectBotTraffic,
  trackGeographicData
};

export default analyticsMiddleware;
