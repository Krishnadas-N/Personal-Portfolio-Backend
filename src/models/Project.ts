import { Schema, model, Document } from 'mongoose';

interface Project extends Document {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    repo?: string;
    images: string[];
    category: string;
    date?: Date;
    featured: boolean;
    collaborators?: string[]; 
  }
  
  const projectSchema = new Schema<Project>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    link: { type: String },
    repo: { type: String },
    images: [{ type: String }],
    category: { type: String },
    date: { type: Date },
    featured: { type: Boolean, default: false },
    collaborators: [{ type: String }],
  }, { timestamps: true });
  
  export default model<Project>('Project', projectSchema);
  