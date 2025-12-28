import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcryptjs';

interface Admin extends Document {
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  profileImage?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String },
  },
  { timestamps: true }
);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  (this as any).password = await bcrypt.hash((this as any).password as string, 12);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<Admin>("Admin", AdminSchema);