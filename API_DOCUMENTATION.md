# 🚀 Professional Portfolio Backend API Documentation

## 📋 **API Overview**

This is a comprehensive, enterprise-level backend API for personal portfolio websites with advanced admin functionality, analytics, and user engagement features.

## 🏗️ **Architecture & Naming Conventions**

### **Professional File Structure**
```
src/
├── controllers/
│   ├── adminDashboardController.ts    # Admin dashboard & analytics
│   ├── mediaManagementController.ts    # File upload & media management
│   ├── userEngagementController.ts     # User interactions & engagement
│   └── [existing controllers...]
├── services/
│   ├── visitorAnalyticsService.ts      # Analytics & tracking
│   ├── communicationService.ts         # Email & notifications
│   └── [existing services...]
├── middlewares/
│   ├── analyticsMiddleware.ts          # Analytics & monitoring
│   └── [existing middlewares...]
├── routes/
│   ├── apiRoutes.ts                    # Main API routes
│   └── [existing routes...]
└── models/
    ├── Portfolio.ts                    # Portfolio-specific models
    └── [existing models...]
```

### **RESTful API Endpoints**

## 🔐 **Authentication**

All admin endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 **Admin Dashboard API**

### **Dashboard & Analytics**

#### `GET /api/admin/dashboard`
Get comprehensive admin dashboard with analytics, visitor insights, and recent activity.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalContacts": 45,
      "totalProjects": 12,
      "totalBlogs": 8,
      "totalVisitors": 1250,
      "totalComments": 23,
      "totalNewsletterSubscribers": 89,
      "totalNewsletterCampaigns": 3
    },
    "growth": {
      "visitors": { "weekly": "15.2", "monthly": "8.7" },
      "comments": { "weekly": "12.5", "monthly": "6.3" }
    },
    "analytics": {
      "today": { "pageViews": 45, "uniqueVisitors": 23 },
      "weekly": [...],
      "monthly": [...]
    },
    "topContent": {
      "projects": [...],
      "blogs": [...],
      "pages": [...]
    },
    "demographics": {
      "devices": [...],
      "countries": [...]
    },
    "recent": {
      "contacts": [...],
      "projects": [...],
      "blogs": [...],
      "visitors": [...],
      "comments": [...]
    }
  }
}
```

#### `GET /api/admin/analytics`
Get detailed analytics data with date filtering.

**Query Parameters:**
- `period`: `7d`, `30d`, `90d` (default: `30d`)
- `startDate`: ISO date string
- `endDate`: ISO date string

#### `GET /api/admin/visitors`
Get visitor insights and demographics.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `country`: Filter by country
- `device`: Filter by device type
- `isReturning`: Filter by returning visitors

### **Portfolio Settings Management**

#### `GET /api/admin/settings`
Get current portfolio configuration settings.

#### `PUT /api/admin/settings`
Update portfolio configuration settings.

**Request Body:**
```json
{
  "siteName": "John Doe Portfolio",
  "siteDescription": "Full-stack developer portfolio",
  "siteKeywords": ["developer", "portfolio", "web development"],
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "accentColor": "#F59E0B",
    "fontFamily": "Inter",
    "darkMode": false
  },
  "features": {
    "blog": true,
    "projects": true,
    "testimonials": true,
    "contact": true,
    "analytics": true,
    "chatBot": true,
    "newsletter": true
  }
}
```

### **Comment Management**

#### `GET /api/admin/comments`
Get comments with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: `pending`, `approved`, `rejected`, `spam`
- `postType`: `blog`, `project`
- `postId`: Specific post ID

#### `PATCH /api/admin/comments/:id/status`
Update comment status (approve/reject).

**Request Body:**
```json
{
  "status": "approved"
}
```

#### `DELETE /api/admin/comments/:id`
Delete a comment permanently.

### **Newsletter Management**

#### `GET /api/admin/newsletter/subscribers`
Get newsletter subscribers with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: `subscribed`, `unsubscribed`, `pending`
- `search`: Search by email, first name, or last name

#### `GET /api/admin/newsletter/campaigns`
Get newsletter campaigns.

## 📁 **Media Management API**

### **File Upload**

#### `POST /api/admin/media/images`
Upload single image with automatic processing.

**Request:** `multipart/form-data`
- `image`: Image file
- `folder`: S3 folder path (optional)
- `fileType`: `image` or `document`

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded and processed successfully",
  "data": {
    "original": {
      "url": "https://bucket.s3.amazonaws.com/images/image.jpg",
      "key": "images/image.jpg",
      "size": 1024000
    },
    "processed": [
      {
        "size": "thumbnail",
        "url": "https://bucket.s3.amazonaws.com/processed/image-thumbnail.jpg",
        "key": "processed/image-thumbnail.jpg"
      },
      {
        "size": "medium",
        "url": "https://bucket.s3.amazonaws.com/processed/image-medium.jpg",
        "key": "processed/image-medium.jpg"
      }
    ],
    "metadata": {
      "fieldName": "image",
      "originalName": "photo.jpg",
      "uploadedBy": "admin_id",
      "uploadDate": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### `POST /api/admin/media/images/batch`
Upload multiple images at once.

**Request:** `multipart/form-data`
- `images`: Array of image files
- `folder`: S3 folder path
- `maxCount`: Maximum number of files (default: 5)

#### `POST /api/admin/media/files`
Upload mixed file types (images, documents, videos).

**Request:** `multipart/form-data`
- `images`: Image files
- `documents`: Document files
- `videos`: Video files

### **File Management**

#### `DELETE /api/admin/media/files/:key`
Delete file from S3 storage.

#### `GET /api/admin/media/files/:key/signed-url`
Get signed URL for private file access.

**Query Parameters:**
- `expiresIn`: Expiration time in seconds (default: 3600)

#### `GET /api/admin/media/files`
List files in S3 storage.

**Query Parameters:**
- `folder`: Filter by folder
- `prefix`: Filter by prefix

#### `GET /api/admin/media/statistics`
Get upload statistics and file analytics.

## 👥 **User Engagement API**

### **Analytics Tracking**

#### `POST /api/analytics/page-visits`
Track page visits for analytics.

**Request Body:**
```json
{
  "sessionId": "session_123",
  "page": "/projects/project-1",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "country": "United States",
  "city": "New York",
  "device": {
    "type": "desktop",
    "os": "Windows",
    "browser": "Chrome"
  }
}
```

### **Content Engagement**

#### `POST /api/engagement/likes/:itemType/:itemId`
Like or unlike content (blog posts, projects, comments).

**Path Parameters:**
- `itemType`: `blog`, `project`, `comment`
- `itemId`: ID of the content

**Request Body:**
```json
{
  "userId": "user_123",
  "sessionId": "session_123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Liked successfully",
  "data": {
    "isLiked": true,
    "likesCount": 15
  }
}
```

### **Comment System**

#### `POST /api/engagement/comments`
Submit a new comment.

**Request Body:**
```json
{
  "postId": "project_123",
  "postType": "project",
  "author": {
    "name": "John Doe",
    "email": "john@example.com",
    "website": "https://johndoe.com",
    "avatar": "https://example.com/avatar.jpg"
  },
  "content": "Great project! I love the design.",
  "parentComment": "comment_456"
}
```

#### `GET /api/engagement/comments/:postType/:postId`
Get approved comments for a specific post.

**Path Parameters:**
- `postType`: `blog` or `project`
- `postId`: ID of the post

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Comments per page (default: 10)

### **Newsletter Communication**

#### `POST /api/communication/newsletter/subscribe`
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "frequency": "weekly",
    "categories": ["general", "projects"]
  },
  "source": "website"
}
```

#### `POST /api/communication/newsletter/unsubscribe`
Unsubscribe from newsletter.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## 🌐 **Public API**

### **Public Statistics**

#### `GET /api/public/statistics`
Get public portfolio statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProjects": 12,
      "totalBlogs": 8,
      "totalComments": 23,
      "totalLikes": 156,
      "totalVisitors": 1250,
      "featuredProjects": 3,
      "publishedBlogs": 8
    },
    "recent": {
      "projects": [...],
      "blogs": [...]
    }
  }
}
```

### **Content Discovery**

#### `GET /api/public/search`
Search portfolio content.

**Query Parameters:**
- `q`: Search query (required)
- `type`: `projects` or `blogs` (optional)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "projects": [...],
      "blogs": [...],
      "total": 25
    },
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    },
    "query": "react"
  }
}
```

#### `GET /api/public/content/related/:type/:id`
Get related content based on categories, tags, or technologies.

**Path Parameters:**
- `type`: `blog` or `project`
- `id`: ID of the content

**Query Parameters:**
- `limit`: Number of related items (default: 5)

## 🔧 **Configuration**

### **Environment Variables**

```env
# Server Configuration
PORT=5000
NODE_ENV=production
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/portfolio
REDIS_URI=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# AWS S3
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

# Features
ANALYTICS_ENABLED=true
EMAIL_NOTIFICATIONS=true
IMAGE_PROCESSING_ENABLED=true
FEATURE_NEWSLETTER=true
FEATURE_COMMENTS=true
FEATURE_LIKES=true
FEATURE_SEARCH=true
```

## 📈 **Rate Limiting**

- **Public endpoints**: 100 requests per 15 minutes per IP
- **Admin endpoints**: 1000 requests per 15 minutes per authenticated user
- **Upload endpoints**: 10 requests per minute per authenticated user

## 🛡️ **Security**

- **Authentication**: JWT tokens for admin access
- **Authorization**: Role-based access control
- **CSRF Protection**: Enabled for state-changing operations
- **Input Validation**: Comprehensive validation for all inputs
- **XSS Protection**: Automatic sanitization of user inputs
- **Rate Limiting**: Protection against abuse
- **Bot Detection**: Automatic bot traffic identification

## 📊 **Analytics & Monitoring**

- **Page View Tracking**: Automatic visitor analytics
- **Performance Monitoring**: Slow request detection
- **Error Tracking**: Comprehensive error logging
- **Security Monitoring**: Suspicious activity detection
- **Real-time Metrics**: Live dashboard updates

## 🚀 **Deployment**

### **Docker**
```bash
docker build -t portfolio-backend .
docker run -p 5000:5000 portfolio-backend
```

### **PM2**
```bash
pm2 start ecosystem.config.js
pm2 monit
```

---

**Built with ❤️ for professional portfolio websites**
