import mongoose, { Document, Schema } from "mongoose";

interface Experience extends Document {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  companyLogo?: string;
  companyWebsite?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  industry?: string;
  teamSize?: number;
  reportingTo?: string;
}

const ExperienceSchema: Schema = new Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    companyLogo: { type: String },
    companyWebsite: { type: String },
    employmentType: { 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      default: 'full-time'
    },
    industry: { type: String },
    teamSize: { type: Number },
    reportingTo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<Experience>("Experience", ExperienceSchema);