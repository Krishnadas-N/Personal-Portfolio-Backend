import { Schema, model, Document } from 'mongoose';

interface Experience extends Document {
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
    responsibilities: string[];
    technologies: string[];
    achievements?: string[];
  }
  
  const experienceSchema = new Schema<Experience>({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
    responsibilities: [{ type: String }],
    technologies: [{ type: String }],
    achievements: [{ type: String }],
  }, { timestamps: true });
  
  export default model<Experience>('Experience', experienceSchema);
  