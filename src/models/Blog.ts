import { Schema, model, Document } from 'mongoose';

interface Comment {
  userId: string;
  username: string;
  comment: string;
  date: Date;
  likes: number;
  replies: {
    userId: string;
    username: string;
    comment: string;
    date: Date;
  }[];
}

interface Meta {
  description: string;
  keywords: string[];
  ogImage: string;
}

interface Blog extends Document {
  title: string;
  content: string;
  summary?: string;
  author: string;
  tags: string[];
  image?: string;
  publishedDate: Date;
  lastUpdated: Date;
  featured: boolean;
  readingTime?: number;
  likes: number;
  views: number;
  isDeleted: boolean;
  comments: Comment[];
  category: string;
  slug: string;
  meta: Meta;
  sharedCount: number;
  visibility: "Public" | "Private";
  relatedArticles: {
    articleId: string;
    title: string;
    slug: string;
  }[];
  socialMediaShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    pinterest?: number;
  };
}

  
const blogSchema = new Schema<Blog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    author: { type: String, default: "Krishnadas N" },
    tags: [{ type: String }],
    image: { type: String },
    publishedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    comments: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        replies: [
          {
            userId: { type: String, required: true },
            username: { type: String, required: true },
            comment: { type: String, required: true },
            date: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    category: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    meta: {
      description: { type: String },
      keywords: [{ type: String }],
      ogImage: { type: String },
    },
    sharedCount: { type: Number, default: 0 },
    visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
    relatedArticles: [
      {
        articleId: { type: String, required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
      },
    ],
    socialMediaShares: {
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      pinterest: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default model<Blog>('Blog', blogSchema);
