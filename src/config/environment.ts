// Enhanced Environment Configuration
export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
  },

  // Database Configuration
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
    redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10')
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000') // 24 hours
  },

  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3BucketName: process.env.S3_BUCKET_NAME || 'portfolio-assets',
    s3BaseUrl: process.env.S3_BASE_URL || 'https://portfolio-assets.s3.amazonaws.com'
  },

  // Email Configuration
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@portfolio.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@portfolio.com'
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
  },

  // Security Configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    csrfEnabled: process.env.CSRF_ENABLED !== 'false',
    hppEnabled: process.env.HPP_ENABLED !== 'false',
    xssProtection: process.env.XSS_PROTECTION !== 'false'
  },

  // Cache Configuration
  cache: {
    redisEnabled: process.env.REDIS_ENABLED !== 'false',
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour
    longTtl: parseInt(process.env.CACHE_LONG_TTL || '86400'), // 24 hours
    shortTtl: parseInt(process.env.CACHE_SHORT_TTL || '300'), // 5 minutes
    veryLongTtl: parseInt(process.env.CACHE_VERY_LONG_TTL || '604800') // 7 days
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
    trackPageViews: process.env.TRACK_PAGE_VIEWS !== 'false',
    trackUserInteractions: process.env.TRACK_USER_INTERACTIONS !== 'false',
    trackErrors: process.env.TRACK_ERRORS !== 'false',
    trackPerformance: process.env.TRACK_PERFORMANCE !== 'false',
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')
  },

  // Notification Configuration
  notifications: {
    emailEnabled: process.env.EMAIL_NOTIFICATIONS !== 'false',
    slackEnabled: process.env.SLACK_NOTIFICATIONS === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    webhookEnabled: process.env.WEBHOOK_NOTIFICATIONS === 'true',
    webhookUrl: process.env.WEBHOOK_URL || ''
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    imageProcessingEnabled: process.env.IMAGE_PROCESSING_ENABLED !== 'false',
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '300'),
    mediumSize: parseInt(process.env.MEDIUM_SIZE || '800'),
    largeSize: parseInt(process.env.LARGE_SIZE || '1200')
  },

  // Portfolio Configuration
  portfolio: {
    siteName: process.env.SITE_NAME || 'My Portfolio',
    siteDescription: process.env.SITE_DESCRIPTION || 'A modern portfolio website',
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3000/admin',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    maintenanceMessage: process.env.MAINTENANCE_MESSAGE || 'Site is under maintenance'
  },

  // Feature Flags
  features: {
    blog: process.env.FEATURE_BLOG !== 'false',
    projects: process.env.FEATURE_PROJECTS !== 'false',
    testimonials: process.env.FEATURE_TESTIMONIALS !== 'false',
    contact: process.env.FEATURE_CONTACT !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
    chatBot: process.env.FEATURE_CHATBOT !== 'false',
    newsletter: process.env.FEATURE_NEWSLETTER === 'true',
    comments: process.env.FEATURE_COMMENTS !== 'false',
    likes: process.env.FEATURE_LIKES !== 'false',
    search: process.env.FEATURE_SEARCH !== 'false'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    logFile: process.env.LOG_FILE_PATH || 'logs/app.log',
    maxLogFiles: parseInt(process.env.MAX_LOG_FILES || '5'),
    maxLogSize: process.env.MAX_LOG_SIZE || '10m'
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    metricsPath: process.env.METRICS_PATH || '/metrics',
    uptimeMonitoring: process.env.UPTIME_MONITORING !== 'false'
  },

  // Development Configuration
  development: {
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
    swaggerPath: process.env.SWAGGER_PATH || '/api-docs',
    enableHotReload: process.env.HOT_RELOAD === 'true',
    enableDebugMode: process.env.DEBUG_MODE === 'true',
    mockDataEnabled: process.env.MOCK_DATA_ENABLED === 'true'
  }
};

// Validation function
export const validateConfig = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }

  // Validate AWS configuration if S3 is being used
  if (process.env.S3_BUCKET_NAME) {
    const awsRequiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
    const missingAwsVars = awsRequiredVars.filter(varName => !process.env[varName]);
    
    if (missingAwsVars.length > 0) {
      console.warn('AWS S3 configuration incomplete:', missingAwsVars);
    }
  }

  // Validate email configuration if email notifications are enabled
  if (config.notifications.emailEnabled) {
    const emailRequiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missingEmailVars = emailRequiredVars.filter(varName => !process.env[varName]);
    
    if (missingEmailVars.length > 0) {
      console.warn('Email configuration incomplete:', missingEmailVars);
    }
  }

  console.log('Configuration validated successfully');
};

export default config;
