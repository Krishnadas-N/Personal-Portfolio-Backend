/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioAnalytics:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         pageViews:
 *           type: number
 *         uniqueVisitors:
 *           type: number
 *         bounceRate:
 *           type: number
 *         avgSessionDuration:
 *           type: number
 *         topPages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *               views:
 *                 type: number
 *               title:
 *                 type: string
 *         referrers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               source:
 *                 type: string
 *               visits:
 *                 type: number
 *         devices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               count:
 *                 type: number
 *         countries:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *               visitors:
 *                 type: number
 * 
 *     PortfolioSettings:
 *       type: object
 *       properties:
 *         siteName:
 *           type: string
 *         siteDescription:
 *           type: string
 *         siteKeywords:
 *           type: array
 *           items:
 *             type: string
 *         siteLogo:
 *           type: string
 *         siteFavicon:
 *           type: string
 *         theme:
 *           type: object
 *           properties:
 *             primaryColor:
 *               type: string
 *             secondaryColor:
 *               type: string
 *             accentColor:
 *               type: string
 *             fontFamily:
 *               type: string
 *             darkMode:
 *               type: boolean
 *         socialMedia:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *               url:
 *                 type: string
 *               icon:
 *                 type: string
 *               active:
 *                 type: boolean
 *         seo:
 *           type: object
 *           properties:
 *             metaTitle:
 *               type: string
 *             metaDescription:
 *               type: string
 *             ogImage:
 *               type: string
 *             twitterCard:
 *               type: string
 *             canonicalUrl:
 *               type: string
 *         features:
 *           type: object
 *           properties:
 *             blog:
 *               type: boolean
 *             projects:
 *               type: boolean
 *             testimonials:
 *               type: boolean
 *             contact:
 *               type: boolean
 *             analytics:
 *               type: boolean
 *             chatBot:
 *               type: boolean
 *             newsletter:
 *               type: boolean
 * 
 *     NewsletterSubscriber:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         status:
 *           type: string
 *           enum: [subscribed, unsubscribed, pending]
 *         subscribedAt:
 *           type: string
 *           format: date-time
 *         unsubscribedAt:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         preferences:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [daily, weekly, monthly]
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *         source:
 *           type: string
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 * 
 *     NewsletterCampaign:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         htmlContent:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, scheduled, sending, sent, failed]
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         sentAt:
 *           type: string
 *           format: date-time
 *         recipients:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             sent:
 *               type: number
 *             delivered:
 *               type: number
 *             opened:
 *               type: number
 *             clicked:
 *               type: number
 *             bounced:
 *               type: number
 *             unsubscribed:
 *               type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         segments:
 *           type: array
 *           items:
 *             type: string
 *         template:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 * 
 *     PortfolioVisitor:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         country:
 *           type: string
 *         city:
 *           type: string
 *         referrer:
 *           type: string
 *         landingPage:
 *           type: string
 *         pagesVisited:
 *           type: array
 *           items:
 *             type: string
 *         sessionDuration:
 *           type: number
 *         isReturning:
 *           type: boolean
 *         device:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             os:
 *               type: string
 *             browser:
 *               type: string
 *         firstVisit:
 *           type: string
 *           format: date-time
 *         lastVisit:
 *           type: string
 *           format: date-time
 *         visitCount:
 *           type: number
 * 
 *     PortfolioComment:
 *       type: object
 *       properties:
 *         postId:
 *           type: string
 *         postType:
 *           type: string
 *           enum: [blog, project]
 *         author:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *             website:
 *               type: string
 *             avatar:
 *               type: string
 *         content:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, spam]
 *         parentComment:
 *           type: string
 *         replies:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: number
 *         isVerified:
 *           type: boolean
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 * 
 *     PortfolioLike:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         sessionId:
 *           type: string
 *         itemId:
 *           type: string
 *         itemType:
 *           type: string
 *           enum: [blog, project, comment]
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 * 
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             original:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 key:
 *                   type: string
 *                 size:
 *                   type: number
 *             processed:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   size:
 *                     type: string
 *                   url:
 *                     type: string
 *                   key:
 *                     type: string
 *             metadata:
 *               type: object
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     adminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: File upload operations
 *   - name: Enhanced Admin
 *     description: Enhanced admin dashboard and management
 *   - name: Interactive Features
 *     description: User interaction features like comments, likes, etc.
 *   - name: Analytics
 *     description: Portfolio analytics and tracking
 *   - name: Newsletter
 *     description: Newsletter management
 *   - name: Comments
 *     description: Comment system management
 */

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload single image
 *     description: Upload a single image file to S3 with automatic processing
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: S3 folder path
 *               fileType:
 *                 type: string
 *                 enum: [image, document]
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple images
 *     description: Upload multiple image files to S3 with automatic processing
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *               maxCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/dashboard/enhanced:
 *   get:
 *     tags: [Enhanced Admin]
 *     summary: Get enhanced admin dashboard
 *     description: Get comprehensive dashboard data including analytics, visitors, and recent activity
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Enhanced dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         totalContacts:
 *                           type: number
 *                         totalProjects:
 *                           type: number
 *                         totalBlogs:
 *                           type: number
 *                         totalVisitors:
 *                           type: number
 *                         totalComments:
 *                           type: number
 *                         totalNewsletterSubscribers:
 *                           type: number
 *                         totalNewsletterCampaigns:
 *                           type: number
 *                     growth:
 *                       type: object
 *                       properties:
 *                         visitors:
 *                           type: object
 *                           properties:
 *                             weekly:
 *                               type: string
 *                             monthly:
 *                               type: string
 *                         comments:
 *                           type: object
 *                           properties:
 *                             weekly:
 *                               type: string
 *                             monthly:
 *                               type: string
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         today:
 *                           $ref: '#/components/schemas/PortfolioAnalytics'
 *                         weekly:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PortfolioAnalytics'
 *                         monthly:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PortfolioAnalytics'
 *                     topContent:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: array
 *                         blogs:
 *                           type: array
 *                         pages:
 *                           type: array
 *                     demographics:
 *                       type: object
 *                       properties:
 *                         devices:
 *                           type: array
 *                         countries:
 *                           type: array
 *                     recent:
 *                       type: object
 *                       properties:
 *                         contacts:
 *                           type: array
 *                         projects:
 *                           type: array
 *                         blogs:
 *                           type: array
 *                         visitors:
 *                           type: array
 *                         comments:
 *                           type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     tags: [Enhanced Admin]
 *     summary: Get portfolio settings
 *     description: Get current portfolio configuration settings
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Portfolio settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioSettings'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Enhanced Admin]
 *     summary: Update portfolio settings
 *     description: Update portfolio configuration settings
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioSettings'
 *     responses:
 *       200:
 *         description: Portfolio settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioSettings'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/track/visit:
 *   post:
 *     tags: [Interactive Features]
 *     summary: Track page visit
 *     description: Track a page visit for analytics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               page:
 *                 type: string
 *               referrer:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               device:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   os:
 *                     type: string
 *                   browser:
 *                     type: string
 *     responses:
 *       200:
 *         description: Visit tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     visitorId:
 *                       type: string
 *                     isReturning:
 *                       type: boolean
 *                     visitCount:
 *                       type: number
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/like/{itemType}/{itemId}:
 *   post:
 *     tags: [Interactive Features]
 *     summary: Like/Unlike content
 *     description: Toggle like status for blog posts, projects, or comments
 *     parameters:
 *       - in: path
 *         name: itemType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blog, project, comment]
 *         description: Type of content to like
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content to like
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               userAgent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                     likesCount:
 *                       type: number
 *       400:
 *         description: Bad request
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Submit comment
 *     description: Submit a new comment for a blog post or project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               postType:
 *                 type: string
 *                 enum: [blog, project]
 *               author:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   website:
 *                     type: string
 *                   avatar:
 *                     type: string
 *               content:
 *                 type: string
 *               parentComment:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               userAgent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioComment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/comments/{postType}/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a post
 *     description: Get all approved comments for a specific blog post or project
 *     parameters:
 *       - in: path
 *         name: postType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blog, project]
 *         description: Type of post
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PortfolioComment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                         pages:
 *                           type: number
 *                         total:
 *                           type: number
 *       400:
 *         description: Bad request
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /api/newsletter/subscribe:
 *   post:
 *     tags: [Newsletter]
 *     summary: Subscribe to newsletter
 *     description: Subscribe to the portfolio newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, monthly]
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *               source:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               userAgent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully subscribed to newsletter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/NewsletterSubscriber'
 *       400:
 *         description: Bad request (email already subscribed)
 */

/**
 * @swagger
 * /api/newsletter/unsubscribe:
 *   post:
 *     tags: [Newsletter]
 *     summary: Unsubscribe from newsletter
 *     description: Unsubscribe from the portfolio newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from newsletter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Email not found in subscribers list
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Get portfolio statistics
 *     description: Get public portfolio statistics and metrics
 *     responses:
 *       200:
 *         description: Portfolio statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalProjects:
 *                           type: number
 *                         totalBlogs:
 *                           type: number
 *                         totalComments:
 *                           type: number
 *                         totalLikes:
 *                           type: number
 *                         totalVisitors:
 *                           type: number
 *                         featuredProjects:
 *                           type: number
 *                         publishedBlogs:
 *                           type: number
 *                     recent:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: array
 *                         blogs:
 *                           type: array
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Interactive Features]
 *     summary: Search portfolio content
 *     description: Search through blog posts and projects
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [projects, blogs]
 *         description: Type of content to search
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: array
 *                         blogs:
 *                           type: array
 *                         total:
 *                           type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                         pages:
 *                           type: number
 *                         total:
 *                           type: number
 *                     query:
 *                       type: string
 *       400:
 *         description: Bad request (missing search query)
 */

/**
 * @swagger
 * /api/related/{type}/{id}:
 *   get:
 *     tags: [Interactive Features]
 *     summary: Get related content
 *     description: Get related blog posts or projects based on categories, tags, or technologies
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blog, project]
 *         description: Type of content
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 5
 *         description: Number of related items to return
 *     responses:
 *       200:
 *         description: Related content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request (invalid content type)
 *       404:
 *         description: Content not found
 */
