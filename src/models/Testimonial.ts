import { Schema, model, Document } from 'mongoose';

interface Testimonial extends Document {
    name: string;
    position?: string;
    company?: string;
    message: string;
    date: Date;
    rating?: number;
  }
  
  const testimonialSchema = new Schema<Testimonial>({
    name: { type: String, required: true },
    position: { type: String },
    company: { type: String },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
  }, { timestamps: true });
  
  export default model<Testimonial>('Testimonial', testimonialSchema);
  