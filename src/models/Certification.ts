import { Schema, model, Document } from 'mongoose';

interface Certification extends Document {
  title: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skillsGained: string[];
}

const certificationSchema = new Schema<Certification>({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expirationDate: { type: Date },
  credentialId: { type: String },
  credentialUrl: { type: String },
  description: { type: String },
  skillsGained: [{ type: String }],
}, { timestamps: true });

export default model<Certification>('Certification', certificationSchema);
