import { Schema, model, Document } from 'mongoose';

interface Skill extends Document {
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    experienceYears?: number;
  }
  
  const skillSchema = new Schema<Skill>({
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    category: { type: String },
    experienceYears: { type: Number },
  }, { timestamps: true });
  
  export default model<Skill>('Skill', skillSchema);
  