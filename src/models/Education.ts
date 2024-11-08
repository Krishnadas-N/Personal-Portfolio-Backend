import { Schema, model, Document } from 'mongoose';

interface Education extends Document {
    degree: string;
    institution: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    grade?: string;
    activities: string[];
    description?: string;
    courses?: string[];
  }
  
  const educationSchema = new Schema<Education>({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    grade: { type: String },
    activities: [{ type: String }],
    description: { type: String },
    courses: [{ type: String }],
  }, { timestamps: true });
  
  export default model<Education>('Education', educationSchema);
  