import { Schema, model, Document } from 'mongoose';

interface Experience extends Document {
    title: string;
    companyLogo:string,
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
    technologies: string[];
    workType?: string; 
    locationType?: string;
  }
  
  const experienceSchema = new Schema<Experience>({
    title: { type: String, required: true },
    companyLogo:{ type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
    technologies: [{ type: String }],
    workType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'],
      default: 'Full-time',
    }, 
    locationType: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'On-site',
    },
  }, { timestamps: true });
  
  export default model<Experience>('Experience', experienceSchema);
  