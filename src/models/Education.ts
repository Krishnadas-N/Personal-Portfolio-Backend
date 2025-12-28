import mongoose, { Document, Schema } from "mongoose";

interface Education extends Document {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  description?: string;
  activities?: string[];
  skills?: string[];
  achievements?: string[];
  location?: string;
  isCurrent: boolean;
  logo?: string;
  website?: string;
}

const EducationSchema: Schema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    gpa: { type: Number },
    description: { type: String },
    activities: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    location: { type: String },
    isCurrent: { type: Boolean, default: false },
    logo: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<Education>("Education", EducationSchema);