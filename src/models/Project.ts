import { Schema, model, Document } from 'mongoose';

interface Project extends Document {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    repo?: string;
    images: string[];
    skills: string[];
    projectType:string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    featured: boolean;
    collaborators?: string[];
    status: 'Planning' | 'In Progress' | 'Completed';
    viewsCount: number;
    likes: number;
    tags?: string[];
    relatedProjects?: Schema.Types.ObjectId[];
    license?: string;
    documentationLink?: string;
    priority?: number;
    lastUpdatedBy?: string; 
    deploymentDetails?: {
        platform: string;
        url: string;
    }[];
    archived?: boolean;
    seoKeywords?: string[]; 
    additionalResources?: string[];
    videoRepresentation?: string;
}

const projectSchema = new Schema<Project>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    link: { type: String },
    repo: { type: String },
    images: [{ type: String }],
    projectType: { type: String, enum: ['main', 'mini'], required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    skills: [{ type: String }],
    featured: { type: Boolean, default: false },
    collaborators: [{ type: String }],
    status: { type: String, enum: ['Planning', 'In Progress', 'Completed'], default: 'Completed' },
    viewsCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: [{ type: String }],
    relatedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    license: { type: String },
    documentationLink: { type: String },
    lastUpdatedBy: { type: String },
    deploymentDetails: [
        {
            platform: { type: String },
            url: { type: String }
        }
    ],
    archived: { type: Boolean, default: false },
    seoKeywords: [{ type: String }],
    additionalResources: [{ type: String }],
    videoRepresentation: { type: String } 
}, { timestamps: true });

export default model<Project>('Project', projectSchema);
