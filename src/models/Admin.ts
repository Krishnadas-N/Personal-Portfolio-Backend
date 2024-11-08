import { Schema, model, Document } from 'mongoose';

interface Admin extends Document {
    username: string;
    password: string;
    email: string;
    role: 'SuperAdmin' | 'Admin' | 'Editor';
    permissions: string[];
    lastLogin?: Date;
  }
  
  const adminSchema = new Schema<Admin>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['SuperAdmin', 'Admin', 'Editor'], default: 'Admin' },
    permissions: [{ type: String }],
    lastLogin: { type: Date },
  }, { timestamps: true });
  
  export default model<Admin>('Admin', adminSchema);
  