# 🚀 Enhanced Personal Portfolio Backend

A comprehensive, feature-rich backend for personal portfolio websites with advanced admin functionality, analytics, and interactive features.

## ✨ **New Features Added**

### 🎯 **Core Enhancements**
- **S3 Image Upload System** - Automatic image processing and optimization
- **Enhanced Admin Dashboard** - Comprehensive analytics and management
- **Interactive Features** - Comments, likes, newsletter, search
- **Real-time Analytics** - Visitor tracking and engagement metrics
- **Advanced Security** - Bot detection, rate limiting, security monitoring
- **Notification System** - Email notifications and alerts
- **Portfolio Settings** - Dynamic configuration management

### 📊 **Analytics & Tracking**
- **Visitor Analytics** - Track page views, sessions, and user behavior
- **Geographic Tracking** - Country and city-level visitor data
- **Device Analytics** - Browser, OS, and device type tracking
- **Performance Monitoring** - Slow request detection and alerting
- **Security Monitoring** - Suspicious activity detection
- **Real-time Dashboard** - Live visitor and engagement metrics

### 🎨 **Content Management**
- **Dynamic Portfolio Settings** - Theme, SEO, and feature configuration
- **Advanced Image Processing** - Multiple sizes, optimization, thumbnails
- **Content Search** - Full-text search across projects and blogs
- **Related Content** - Smart content recommendations
- **Comment System** - Moderation, replies, and approval workflow
- **Like System** - User engagement tracking

### 📧 **Communication Features**
- **Newsletter System** - Subscriber management and campaigns
- **Email Notifications** - Automated alerts and responses
- **Contact Management** - Enhanced contact form handling
- **Auto-replies** - Automated response system

### 🔧 **Technical Features**
- **S3 Integration** - Cloud storage with automatic processing
- **Redis Caching** - Enhanced performance and session management
- **Error Tracking** - Comprehensive error monitoring and alerting
- **API Documentation** - Complete Swagger/OpenAPI documentation
- **Environment Configuration** - Centralized config management
- **Feature Flags** - Enable/disable features dynamically

## 🛠️ **Installation & Setup**

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Redis 6+
- AWS S3 Account (for image uploads)

### Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/portfolio
REDIS_URI=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=portfolio-assets

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@portfolio.com
ADMIN_EMAIL=admin@portfolio.com

# OpenAI (for chatbot)
OPENAI_API_KEY=your-openai-api-key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Features
ANALYTICS_ENABLED=true
EMAIL_NOTIFICATIONS=true
IMAGE_PROCESSING_ENABLED=true
FEATURE_NEWSLETTER=true
FEATURE_COMMENTS=true
FEATURE_LIKES=true
FEATURE_SEARCH=true
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Personal-Portfolio-Backend
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Install additional packages for new features**
```bash
npm install aws-sdk multer multer-s3 @types/multer @types/multer-s3 sharp @types/sharp
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start the development server**
```bash
npm run dev
```

## 📚 **API Documentation**

### Enhanced Admin Endpoints

#### Dashboard & Analytics
- `GET /api/admin/dashboard/enhanced` - Comprehensive dashboard data
- `GET /api/admin/analytics` - Detailed analytics with date filtering
- `GET /api/admin/visitors` - Visitor insights and demographics
- `GET /api/admin/settings` - Portfolio configuration
- `PUT /api/admin/settings` - Update portfolio settings

#### Content Management
- `GET /api/admin/comments` - Comment management with filtering
- `PATCH /api/admin/comments/:id/status` - Approve/reject comments
- `DELETE /api/admin/comments/:id` - Delete comments
- `GET /api/admin/newsletter/subscribers` - Newsletter subscribers
- `GET /api/admin/newsletter/campaigns` - Newsletter campaigns

#### File Upload
- `POST /api/upload/image` - Single image upload with processing
- `POST /api/upload/images` - Multiple images upload
- `POST /api/upload/mixed` - Mixed file types upload
- `DELETE /api/upload/:key` - Delete files from S3
- `GET /api/upload/list` - List uploaded files
- `GET /api/upload/stats` - Upload statistics

### Interactive Public Endpoints

#### User Engagement
- `POST /api/track/visit` - Track page visits
- `POST /api/like/:itemType/:itemId` - Like/unlike content
- `POST /api/comments` - Submit comments
- `GET /api/comments/:postType/:postId` - Get post comments

#### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

#### Search & Discovery
- `GET /api/search` - Search portfolio content
- `GET /api/related/:type/:id` - Get related content
- `GET /api/stats` - Public portfolio statistics

## 🎨 **Frontend Integration**

### Analytics Tracking
```javascript
// Track page visits
fetch('/api/track/visit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionStorage.getItem('sessionId'),
    page: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    device: {
      type: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      os: navigator.platform,
      browser: navigator.userAgent.split(' ')[0]
    }
  })
});
```

### Like System
```javascript
// Toggle like
const toggleLike = async (itemType, itemId) => {
  const response = await fetch(`/api/like/${itemType}/${itemId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionStorage.getItem('sessionId'),
      ipAddress: await getClientIP()
    })
  });
  
  const result = await response.json();
  updateLikeUI(result.data.isLiked, result.data.likesCount);
};
```

### Comment System
```javascript
// Submit comment
const submitComment = async (postId, postType, commentData) => {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId,
      postType,
      author: commentData.author,
      content: commentData.content,
      parentComment: commentData.parentComment
    })
  });
  
  const result = await response.json();
  if (result.success) {
    showSuccessMessage('Comment submitted for review');
  }
};
```

### Newsletter Subscription
```javascript
// Subscribe to newsletter
const subscribeNewsletter = async (email, preferences) => {
  const response = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      preferences: {
        frequency: 'weekly',
        categories: ['general']
      }
    })
  });
  
  const result = await response.json();
  if (result.success) {
    showSuccessMessage('Successfully subscribed!');
  }
};
```

## 🔧 **Configuration**

### Feature Flags
Control features through environment variables:

```env
FEATURE_BLOG=true
FEATURE_PROJECTS=true
FEATURE_TESTIMONIALS=true
FEATURE_CONTACT=true
FEATURE_ANALYTICS=true
FEATURE_CHATBOT=true
FEATURE_NEWSLETTER=true
FEATURE_COMMENTS=true
FEATURE_LIKES=true
FEATURE_SEARCH=true
```

### Analytics Configuration
```env
ANALYTICS_ENABLED=true
TRACK_PAGE_VIEWS=true
TRACK_USER_INTERACTIONS=true
TRACK_ERRORS=true
TRACK_PERFORMANCE=true
ANALYTICS_RETENTION_DAYS=90
```

### Upload Configuration
```env
MAX_FILE_SIZE=10485760
IMAGE_PROCESSING_ENABLED=true
THUMBNAIL_SIZE=300
MEDIUM_SIZE=800
LARGE_SIZE=1200
```

## 📊 **Analytics Dashboard**

The enhanced admin dashboard provides:

### Overview Metrics
- Total visitors, page views, and sessions
- Growth metrics (weekly/monthly)
- Top content and pages
- Device and geographic breakdown

### Real-time Data
- Active visitors
- Recent comments and likes
- Live performance metrics
- Security alerts

### Content Analytics
- Most popular projects and blogs
- Comment engagement rates
- Search queries and results
- Newsletter subscription rates

## 🔒 **Security Features**

### Enhanced Security
- **Bot Detection** - Automatic bot identification and handling
- **Rate Limiting** - Configurable request rate limits
- **Security Monitoring** - Suspicious activity detection
- **Error Tracking** - Comprehensive error monitoring
- **CSRF Protection** - Cross-site request forgery prevention

### Data Protection
- **Input Validation** - Comprehensive input sanitization
- **XSS Protection** - Cross-site scripting prevention
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Security** - Type validation and scanning

## 🚀 **Deployment**

### Docker Deployment
```bash
# Build Docker image
docker build -t portfolio-backend .

# Run with Docker Compose
docker-compose up -d
```

### PM2 Deployment
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

### Environment-Specific Configuration
- **Development** - Full logging, debug mode, hot reload
- **Staging** - Production-like with test data
- **Production** - Optimized performance, security, monitoring

## 📈 **Performance Optimization**

### Caching Strategy
- **Redis Caching** - Session and data caching
- **CDN Integration** - Static asset delivery
- **Database Optimization** - Indexed queries and aggregation
- **Image Optimization** - Automatic compression and resizing

### Monitoring
- **Health Checks** - Automated system monitoring
- **Performance Metrics** - Response time tracking
- **Error Tracking** - Comprehensive error logging
- **Uptime Monitoring** - Service availability tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 **License**

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the configuration guide

---

**Built with ❤️ for modern portfolio websites**
