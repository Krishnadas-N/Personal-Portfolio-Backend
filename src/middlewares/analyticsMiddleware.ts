import { Request, Response, NextFunction } from 'express';
import VisitorAnalyticsService from '../services/visitorAnalyticsService';
import CommunicationService from '../services/communicationService';

// Pre-compile regex patterns for performance
const SUSPICIOUS_PATTERNS = [
  /\.\./, // Directory traversal
  /<script/i, // XSS attempts
  /union.*select/i, // SQL injection
  /eval\(/i, // Code injection
  /javascript:/i // JavaScript injection
];

const BOT_PATTERNS = [
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

// Analytics tracking middleware
export const trackPageAnalytics = (req: Request, res: Response, next: NextFunction) => {
  // Skip tracking for admin routes and API routes
  if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
    return next();
  }

  // Track page view asynchronously - fire and forget
  setImmediate(() => {
    VisitorAnalyticsService.trackPageView(req, req.path).catch(error => {
      // Silent error logging to prevent log spam
      if (process.env.NODE_ENV === 'development') {
        console.error('Error tracking analytics:', error);
      }
    });
  });

  next();
};

// Enhanced error tracking middleware
export const trackErrorMetrics = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Track 4xx and 5xx errors
    if (res.statusCode >= 400) {
      setImmediate(() => {
        // Only alert on 500s or critical 400s to reduce noise
        if (res.statusCode >= 500) {
           CommunicationService.sendSystemAlert(
            `HTTP ${res.statusCode} Error`,
            `Error occurred on ${req.method} ${req.path}: ${res.statusMessage}`,
            'high'
          ).catch(e => console.error('Failed to send error alert', e));
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
    
    // Log slow requests - Threshold increased to 2s for "slow"
    if (duration > 2000) { 
      setImmediate(() => {
         // Log warning locally, don't spam alerts unless extremely slow (>5s)
         console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
         if (duration > 5000) {
            CommunicationService.sendSystemAlert(
              'Critical Slow Request',
              `${req.method} ${req.path} took ${duration}ms`,
              'medium'
            ).catch(() => {});
         }
      });
    }
  });
  
  next();
};

// Security monitoring middleware
export const trackSecurityMetrics = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const url = req.url;
  
  // Optimization: Only check URL and UA. Checking Body is too expensive here.
  // Body validation should be handled by dedicated validation middleware.
  const isSuspicious = SUSPICIOUS_PATTERNS.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    setImmediate(() => {
      CommunicationService.sendSystemAlert(
        'Suspicious Activity Detected',
        `Suspicious request from ${req.ip}: ${req.method} ${req.path}`,
        'high'
      ).catch(() => {});
    });
  }
  
  next();
};

// Rate limiting tracking middleware
export const trackRateLimitMetrics = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode === 429) { // Too Many Requests
      setImmediate(() => {
        CommunicationService.sendSystemAlert(
          'Rate Limit Exceeded',
          `Rate limit exceeded for IP ${req.ip} on ${req.method} ${req.path}`,
          'medium'
        ).catch(() => {});
      });
    }
  });
  
  next();
};

// Content engagement tracking middleware
// OPTIMIZATION: Removed script injection. Frontend should handle its own analytics.
export const trackUserEngagement = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Bot detection middleware
export const detectBotTraffic = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Use pre-compiled regex
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  
  if (isBot) {
    (req as any).isBot = true; // Use type assertion if definition is missing
    // Optional: Log bot traffic only in debug mode
    // console.log(`Bot detected: ${userAgent}`);
  } else {
    (req as any).isBot = false;
  }
  
  next();
};

// Geographic tracking middleware
export const trackGeographicData = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder is fine, but should be async/non-blocking
  // No changes needed as it was already basic
  (req as any).geoData = {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    timezone: 'UTC'
  };
    
  next();
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
