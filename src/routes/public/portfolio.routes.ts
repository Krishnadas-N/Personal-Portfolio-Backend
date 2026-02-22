import { Router } from 'express';
import {
  // Projects
  getProjects,
  getProject,
  
  // Blogs
  getBlogs,
  getBlog,
  
  // Experience
  getExperiences,
  getExperience,
  
  // Education
  getEducation,
  getEducationById,
  
  // Skills
  getSkills,
  getSkill,
  
  // Certifications
  getCertifications,
  getCertification,
  
  // Testimonials
  getTestimonials,
  getTestimonial,
} from '../../controllers';

import { cache, cacheDurations } from '../../middlewares/cache';

const router = Router();

// ==================== PROJECTS ====================
router.get('/projects', cache(cacheDurations.medium), getProjects);
router.get('/projects/:id', cache(cacheDurations.short), getProject);

// ==================== BLOGS ====================
router.get('/blogs', cache(cacheDurations.medium), getBlogs);
router.get('/blogs/:slug', cache(cacheDurations.short), getBlog);

// ==================== EXPERIENCE ====================
router.get('/experiences', cache(cacheDurations.long), getExperiences);
router.get('/experiences/:id', cache(cacheDurations.long), getExperience);

// ==================== EDUCATION ====================
router.get('/education', cache(cacheDurations.long), getEducation);
router.get('/education/:id', cache(cacheDurations.long), getEducationById);

// ==================== SKILLS ====================
router.get('/skills', cache(cacheDurations.long), getSkills);
router.get('/skills/:id', cache(cacheDurations.long), getSkill);

// ==================== CERTIFICATIONS ====================
router.get('/certifications', cache(cacheDurations.long), getCertifications);
router.get('/certifications/:id', cache(cacheDurations.long), getCertification);

// ==================== TESTIMONIALS ====================
router.get('/testimonials', cache(cacheDurations.medium), getTestimonials);
router.get('/testimonials/:id', cache(cacheDurations.long), getTestimonial);

export default router;
