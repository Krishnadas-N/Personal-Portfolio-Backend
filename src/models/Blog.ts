import mongoose, { Document, Schema } from "mongoose";

interface Blog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: Schema.Types.ObjectId;
  tags: string[];
  category: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  viewsCount: number;
  likes: number;
  comments: Schema.Types.ObjectId[];
  seoTitle?: string;
  seoDescription?: string;
  readingTime: number;
  isFeatured: boolean;
  relatedPosts: Schema.Types.ObjectId[];
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] },
    category: { type: String, required: true },
    featuredImage: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    viewsCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    seoTitle: { type: String },
    seoDescription: { type: String },
    readingTime: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    relatedPosts: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
  },
  { timestamps: true }
);

// Generate slug from title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') && !(this as any).slug) {
    (this as any).slug = (this as any).title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Calculate reading time
BlogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = (this as any).content.split(/\s+/).length;
    (this as any).readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

export default mongoose.model<Blog>("Blog", BlogSchema);