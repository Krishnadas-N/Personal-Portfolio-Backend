import { Schema, model, Document } from 'mongoose';

interface Skill extends Document {
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    logo?: string;
  }
  
  const skillSchema = new Schema<Skill>({
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    category: { type: String },
    logo: { type: String }, 
  }, { timestamps: true });
  
  export default model<Skill>('Skill', skillSchema);
  