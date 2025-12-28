import mongoose, { Document, Schema } from "mongoose";

// Portfolio Analytics Model
export interface PortfolioAnalytics extends Document {
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    title: string;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
  }>;
  devices: Array<{
    type: string;
    count: number;
  }>;
  countries: Array<{
    country: string;
    visitors: number;
  }>;
  userAgent?: string;
}

const PortfolioAnalyticsSchema: Schema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 },
  topPages: [{
    path: { type: String },
    views: { type: Number },
    title: { type: String }
  }],
  referrers: [{
    source: { type: String },
    visits: { type: Number }
  }],
  devices: [{
    type: { type: String },
    count: { type: Number }
  }],
  countries: [{
    country: { type: String },
    visitors: { type: Number }
  }],
  userAgent: { type: String }
}, { timestamps: true });

// Portfolio Settings Model
export interface PortfolioSettings extends Document {
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  siteLogo?: string;
  siteFavicon?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    darkMode: boolean;
  };
  socialMedia: Array<{
    platform: string;
    url: string;
    icon: string;
    active: boolean;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
    twitterCard?: string;
    canonicalUrl?: string;
  };
  features: {
    blog: boolean;
    projects: boolean;
    testimonials: boolean;
    contact: boolean;
    analytics: boolean;
    chatBot: boolean;
    newsletter: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
}

const PortfolioSettingsSchema: Schema = new Schema({
  siteName: { type: String, required: true, default: "Portfolio" },
  siteDescription: { type: String, required: true },
  profileImage: { type: String },
  siteKeywords: [{ type: String }],
  siteLogo: { type: String },
  siteFavicon: { type: String },
  theme: {
    primaryColor: { type: String, default: "#3B82F6" },
    secondaryColor: { type: String, default: "#1E40AF" },
    accentColor: { type: String, default: "#F59E0B" },
    fontFamily: { type: String, default: "Inter" },
    darkMode: { type: Boolean, default: false }
  },
  socialMedia: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String },
    active: { type: Boolean, default: true }
  }],
  contact: {
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    mapUrl: { type: String }
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
    twitterCard: { type: String },
    canonicalUrl: { type: String }
  },
  features: {
    blog: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    testimonials: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    chatBot: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  },
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: { type: String },
    allowedIPs: [{ type: String }]
  },
  notifications: {
    email: { type: Boolean, default: true },
    slack: { type: Boolean, default: false },
    webhook: { type: Boolean, default: false },
    webhookUrl: { type: String }
  }
}, { timestamps: true });


// Newsletter Subscriber Model
export interface NewsletterSubscriber extends Document {
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  tags: string[];
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

const NewsletterSubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  firstName: { type: String },
  lastName: { type: String },
  status: { type: String, enum: ['subscribed', 'unsubscribed', 'pending'], default: 'subscribed' },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  tags: [{ type: String }],
  preferences: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    categories: [{ type: String }]
  },
  source: { type: String, default: 'website' },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Newsletter Campaign Model
export interface NewsletterCampaign extends Document {
  title: string;
  subject: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  tags: string[];
  segments: string[];
  template?: string;
  attachments?: string[];
}

const NewsletterCampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  htmlContent: { type: String },
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'], default: 'draft' },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  recipients: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },
  tags: [{ type: String }],
  segments: [{ type: String }],
  template: { type: String },
  attachments: [{ type: String }]
}, { timestamps: true });

// Portfolio Visitor Model
export interface PortfolioVisitor extends Document {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  referrer?: string;
  landingPage: string;
  pagesVisited: string[];
  viewedBlogs: Schema.Types.ObjectId[];
  viewedProjects: Schema.Types.ObjectId[];
  sessionDuration: number;
  isReturning: boolean;
  device: {
    type: string;
    os: string;
    browser: string;
  };
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
}

const PortfolioVisitorSchema: Schema = new Schema({
  sessionId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  country: { type: String },
  city: { type: String },
  referrer: { type: String },
  landingPage: { type: String, required: true },
  pagesVisited: [{ type: String }],
  viewedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  viewedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  sessionDuration: { type: Number, default: 0 },
  isReturning: { type: Boolean, default: false },
  device: {
    type: { type: String },
    os: { type: String },
    browser: { type: String }
  },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 }
}, { timestamps: true });

// Portfolio Comment Model
export interface PortfolioComment extends Document {
  postId: Schema.Types.ObjectId;
  postType: 'blog' | 'project';
  author: {
    name: string;
    email: string;
    website?: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  parentComment?: Schema.Types.ObjectId;
  replies: Schema.Types.ObjectId[];
  likes: number;
  isVerified: boolean;
  ipAddress?: string;
  userAgent?: string;
}

const PortfolioCommentSchema: Schema = new Schema({
  postId: { type: Schema.Types.ObjectId, required: true },
  postType: { type: String, enum: ['blog', 'project'], required: true },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    avatar: { type: String }
  },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'spam'], default: 'pending' },
  parentComment: { type: Schema.Types.ObjectId, ref: 'PortfolioComment' },
  replies: [{ type: Schema.Types.ObjectId, ref: 'PortfolioComment' }],
  likes: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Portfolio Like Model
export interface PortfolioLike extends Document {
  userId?: string;
  sessionId?: string;
  itemId: Schema.Types.ObjectId;
  itemType: 'blog' | 'project' | 'comment';
  ipAddress?: string;
  userAgent?: string;
}

const PortfolioLikeSchema: Schema = new Schema({
  userId: { type: String },
  sessionId: { type: String },
  itemId: { type: Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['blog', 'project', 'comment'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Create indexes for better performance
PortfolioAnalyticsSchema.index({ date: 1 });
PortfolioVisitorSchema.index({ sessionId: 1 });
PortfolioVisitorSchema.index({ ipAddress: 1 });
PortfolioCommentSchema.index({ postId: 1, postType: 1 });
PortfolioCommentSchema.index({ status: 1 });
PortfolioLikeSchema.index({ itemId: 1, itemType: 1 });
PortfolioLikeSchema.index({ userId: 1 });
PortfolioLikeSchema.index({ sessionId: 1 });

export const PortfolioAnalytics = mongoose.model<PortfolioAnalytics>('PortfolioAnalytics', PortfolioAnalyticsSchema);
export const PortfolioSettings = mongoose.model<PortfolioSettings>('PortfolioSettings', PortfolioSettingsSchema);
export const NewsletterSubscriber = mongoose.model<NewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
export const NewsletterCampaign = mongoose.model<NewsletterCampaign>('NewsletterCampaign', NewsletterCampaignSchema);
export const PortfolioVisitor = mongoose.model<PortfolioVisitor>('PortfolioVisitor', PortfolioVisitorSchema);
export const PortfolioComment = mongoose.model<PortfolioComment>('PortfolioComment', PortfolioCommentSchema);
export const PortfolioLike = mongoose.model<PortfolioLike>('PortfolioLike', PortfolioLikeSchema);
