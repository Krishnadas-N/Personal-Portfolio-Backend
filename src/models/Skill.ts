import mongoose, { Document, Schema } from "mongoose";

interface Skill extends Document {
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool' | 'framework';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  projects: Schema.Types.ObjectId[];
  certifications: Schema.Types.ObjectId[];
}

const SkillSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['technical', 'soft', 'language', 'tool', 'framework'],
      required: true 
    },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: { type: Number },
    description: { type: String },
    icon: { type: String },
    color: { type: String },
    isActive: { type: Boolean, default: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    certifications: [{ type: Schema.Types.ObjectId, ref: 'Certification' }],
  },
  { timestamps: true }
);

export default mongoose.model<Skill>("Skill", SkillSchema);