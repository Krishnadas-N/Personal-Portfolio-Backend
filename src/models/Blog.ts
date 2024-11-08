import { Schema, model, Document } from 'mongoose';

interface Blog extends Document {
    title: string;
    content: string;
    summary?: string;
    author: string;
    tags: string[];
    image?: string;
    publishedDate: Date;
    featured: boolean;
    readingTime?: number; 
    likes: number;
  }
  
  const blogSchema = new Schema<Blog>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    author: { type: String, default: 'Krishnadas' },
    tags: [{ type: String }],
    image: { type: String },
    publishedDate: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number },
    likes: { type: Number, default: 0 },
  }, { timestamps: true });
  
  export default model<Blog>('Blog', blogSchema);
  