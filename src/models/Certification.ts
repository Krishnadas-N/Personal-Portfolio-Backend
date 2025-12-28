import mongoose, { Document, Schema } from "mongoose";

interface Certification extends Document {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  badgeImage?: string;
  isActive: boolean;
}

const CertificationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    skills: { type: [String], default: [] },
    category: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
    badgeImage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<Certification>("Certification", CertificationSchema);