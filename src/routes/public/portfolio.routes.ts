import { Router } from 'express';
import {
  // Profile
  getProfile,
  
  // Projects
  getProjects,
  getProject,
  getFeaturedProjects,
  getProjectsByTechnology,
  
  // Blogs
  getBlogs,
  getBlog,
  getFeaturedBlogs,
  getBlogsByCategory,
  getBlogCategories,
  
  // Experience
  getExperiences,
  getExperience,
  getCurrentExperiences,
  getExperiencesByCompany,
  
  // Education
  getEducation,
  getEducationById,
  getCurrentEducation,
  getEducationByInstitution,
  
  // Skills
  getSkills,
  getSkill,
  getSkillsByCategory,
  getSkillsByLevel,
  getSkillCategories,
  getSkillLevels,
  
  // Certifications
  getCertifications,
  getCertification,
  getRecentCertifications,
  getCertificationsByIssuer,
  getCertificationsByCategory,
  
  // Testimonials
  getTestimonials,
  getTestimonial,
  getFeaturedTestimonials,
  getVerifiedTestimonials,
  getTestimonialsByCompany
} from '../../controllers';

import { cache, cacheDurations } from '../../middlewares/cache';

const router = Router();

// ==================== PROJECTS ====================
router.get('/projects', cache(cacheDurations.medium), getProjects);
router.get('/projects/featured', cache(cacheDurations.medium), getFeaturedProjects);
router.get('/projects/technology/:tech', cache(cacheDurations.medium), getProjectsByTechnology);
router.get('/projects/:id', cache(cacheDurations.short), getProject);

// ==================== BLOGS ====================
router.get('/blogs', cache(cacheDurations.medium), getBlogs);
router.get('/blogs/featured', cache(cacheDurations.medium), getFeaturedBlogs);
router.get('/blogs/categories', cache(cacheDurations.long), getBlogCategories);
router.get('/blogs/category/:category', cache(cacheDurations.medium), getBlogsByCategory);
router.get('/blogs/:slug', cache(cacheDurations.short), getBlog);

// ==================== EXPERIENCE ====================
router.get('/experiences', cache(cacheDurations.long), getExperiences);
router.get('/experiences/current', cache(cacheDurations.long), getCurrentExperiences);
router.get('/experiences/company/:company', cache(cacheDurations.medium), getExperiencesByCompany);
router.get('/experiences/:id', cache(cacheDurations.long), getExperience);

// ==================== EDUCATION ====================
router.get('/education', cache(cacheDurations.long), getEducation);
router.get('/education/current', cache(cacheDurations.long), getCurrentEducation);
router.get('/education/institution/:institution', cache(cacheDurations.medium), getEducationByInstitution);
router.get('/education/:id', cache(cacheDurations.long), getEducationById);

// ==================== SKILLS ====================
router.get('/skills', cache(cacheDurations.long), getSkills);
router.get('/skills/categories', cache(cacheDurations.veryLong), getSkillCategories);
router.get('/skills/levels', cache(cacheDurations.veryLong), getSkillLevels);
router.get('/skills/category/:category', cache(cacheDurations.long), getSkillsByCategory);
router.get('/skills/level/:level', cache(cacheDurations.long), getSkillsByLevel);
router.get('/skills/:id', cache(cacheDurations.long), getSkill);

// ==================== CERTIFICATIONS ====================
router.get('/certifications', cache(cacheDurations.long), getCertifications);
router.get('/certifications/recent', cache(cacheDurations.medium), getRecentCertifications);
router.get('/certifications/issuer/:issuer', cache(cacheDurations.medium), getCertificationsByIssuer);
router.get('/certifications/category/:category', cache(cacheDurations.medium), getCertificationsByCategory);
router.get('/certifications/:id', cache(cacheDurations.long), getCertification);

// ==================== TESTIMONIALS ====================
router.get('/testimonials', cache(cacheDurations.medium), getTestimonials);
router.get('/testimonials/featured', cache(cacheDurations.medium), getFeaturedTestimonials);
router.get('/testimonials/verified', cache(cacheDurations.medium), getVerifiedTestimonials);
router.get('/testimonials/company/:company', cache(cacheDurations.medium), getTestimonialsByCompany);
router.get('/testimonials/:id', cache(cacheDurations.long), getTestimonial);

export default router;
