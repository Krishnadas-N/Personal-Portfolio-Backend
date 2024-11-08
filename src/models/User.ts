import mongoose, { Document, Schema } from "mongoose";

interface SocialLink {
  platform: string;
  url: string;
  icon: string; 
}

interface Profile extends Document {
  name: string;
  title: string;
  about: string;
  profileImage?: string;
  resume?: string;
  socialLinks: SocialLink[]; 
  skills: string[];
  languages: string[];
  interests: string[];
  availability: string; // e.g., "Freelance", "Full-time", "Part-time"
  location?: string;
  contactEmail?: string;
}

const SocialLinkSchema: Schema = new Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String }, 
});

const ProfileSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    email:{type:String,  required: true}
    about: { type: String, required: true },
    profileImage: { type: String },
    resume: { type: String },
    socialLinks: { type: [SocialLinkSchema], default: [] }, 
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    availability: { type: String, required: true },
    location: { type: String },
    contactEmail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<Profile>("Profile", ProfileSchema);
