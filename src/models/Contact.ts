import mongoose, { Document, Schema } from "mongoose";

interface Contact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'email' | 'phone' | 'social';
  tags: string[];
  assignedTo?: Schema.Types.ObjectId;
  repliedAt?: Date;
  replyMessage?: string;
  isSpam: boolean;
  ipAddress?: string;
  userAgent?: string;
}

const ContactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    source: { type: String, enum: ['website', 'email', 'phone', 'social'], default: 'website' },
    tags: { type: [String], default: [] },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
    repliedAt: { type: Date },
    replyMessage: { type: String },
    isSpam: { type: Boolean, default: false },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<Contact>("Contact", ContactSchema);