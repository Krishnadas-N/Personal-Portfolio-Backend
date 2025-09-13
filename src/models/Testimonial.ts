import mongoose, { Document, Schema } from "mongoose";

interface Testimonial extends Document {
  clientName: string;
  clientPosition: string;
  clientCompany: string;
  clientImage?: string;
  content: string;
  rating: number;
  project?: Schema.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  clientEmail?: string;
  clientLinkedIn?: string;
  verified: boolean;
  verifiedAt?: Date;
}

const TestimonialSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    clientPosition: { type: String, required: true },
    clientCompany: { type: String, required: true },
    clientImage: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    clientEmail: { type: String },
    clientLinkedIn: { type: String },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<Testimonial>("Testimonial", TestimonialSchema);