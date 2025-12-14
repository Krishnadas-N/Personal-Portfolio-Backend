import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcryptjs';

interface SocialLink {
  platform: string;
  url: string;
  icon: string; 
}

interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  profileImage?: string;
  socialLinks: SocialLink[];
  skills: string[];
  languages: string[];
  interests: string[];
  availability: string;
  location?: string;
  bio?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SocialLinkSchema: Schema = new Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String }, 
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String },
    socialLinks: { type: [SocialLinkSchema], default: [] }, 
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    availability: { type: String, default: 'Available' },
    location: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  (this as any).password = await bcrypt.hash((this as any).password as string, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<User>("User", UserSchema);
