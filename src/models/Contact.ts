import { Schema, model, Document } from 'mongoose';

interface Contact extends Document {
    name: string;
    email: string;
    message: string;
    status: 'Pending' | 'Replied';
    receivedDate: Date;
    phone?: string;
  }
  
  const contactSchema = new Schema<Contact>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Replied'], default: 'Pending' },
    receivedDate: { type: Date, default: Date.now },
    phone: { type: String },
  }, { timestamps: true });
  
  export default model<Contact>('Contact', contactSchema);
  