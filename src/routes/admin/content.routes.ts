import { Router } from 'express';
import {
  // Projects
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  getProjectStats,
  getProjects,
  
  // Blogs
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  getBlogStats,
  getBlogs,
  
  // Experiences
  createExperience,
  updateExperience,
  deleteExperience,
  getExperienceStats,
  getExperiences,
  
  // Education
  createEducation,
  updateEducation,
  deleteEducation,
  getEducationStats,
  getEducation,
  
  // Skills
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus,
  getSkillStats,
  getSkills,
  
  // Certifications
  createCertification,
  updateCertification,
  deleteCertification,
  toggleCertificationStatus,
  getCertificationStats,
  getCertifications,
  
  // Testimonials
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  verifyTestimonial,
  featureTestimonial,
  toggleTestimonialStatus,
  getTestimonialStats,
  getTestimonials
} from '../../controllers';

import { authenticateAdmin } from '../../middlewares/auth.middleware';
import {
  projectValidations,
  blogValidations,
  experienceValidations,
  educationValidations,
  skillValidations,
  certificationValidations,
  testimonialValidations
} from '../../middlewares/validation';
import { invalidateCache, cachePatterns } from '../../middlewares/cache';

const router = Router();

// ==================== PROJECTS ====================
router.get('/projects', authenticateAdmin, getProjects);
router.post('/projects', authenticateAdmin, projectValidations.create, invalidateCache(cachePatterns.projects), createProject);
router.put('/projects/:id', authenticateAdmin, projectValidations.update, invalidateCache(cachePatterns.projects), updateProject);
router.delete('/projects/:id', authenticateAdmin, invalidateCache(cachePatterns.projects), deleteProject);
router.patch('/projects/:id/archive', authenticateAdmin, invalidateCache(cachePatterns.projects), archiveProject);
router.get('/projects/stats', authenticateAdmin, getProjectStats);

// ==================== BLOGS ====================
router.get('/blogs', authenticateAdmin, getBlogs);
router.post('/blogs', authenticateAdmin, blogValidations.create, invalidateCache(cachePatterns.blogs), createBlog);
router.put('/blogs/:id', authenticateAdmin, blogValidations.create, invalidateCache(cachePatterns.blogs), updateBlog);
router.delete('/blogs/:id', authenticateAdmin, invalidateCache(cachePatterns.blogs), deleteBlog);
router.patch('/blogs/:id/publish', authenticateAdmin, invalidateCache(cachePatterns.blogs), publishBlog);
router.get('/blogs/stats', authenticateAdmin, getBlogStats);

// ==================== EXPERIENCES ====================
router.get('/experiences', authenticateAdmin, getExperiences);
router.post('/experiences', authenticateAdmin, experienceValidations.create, createExperience);
router.put('/experiences/:id', authenticateAdmin, experienceValidations.create, updateExperience);
router.delete('/experiences/:id', authenticateAdmin, deleteExperience);
router.get('/experiences/stats', authenticateAdmin, getExperienceStats);

// ==================== EDUCATION ====================
router.get('/education', authenticateAdmin, getEducation);
router.post('/education', authenticateAdmin, educationValidations.create, createEducation);
router.put('/education/:id', authenticateAdmin, educationValidations.create, updateEducation);
router.delete('/education/:id', authenticateAdmin, deleteEducation);
router.get('/education/stats', authenticateAdmin, getEducationStats);

// ==================== SKILLS ====================
router.get('/skills', authenticateAdmin, getSkills);
router.post('/skills', authenticateAdmin, skillValidations.create, createSkill);
router.put('/skills/:id', authenticateAdmin, skillValidations.create, updateSkill);
router.delete('/skills/:id', authenticateAdmin, deleteSkill);
router.patch('/skills/:id/toggle', authenticateAdmin, toggleSkillStatus);
router.get('/skills/stats', authenticateAdmin, getSkillStats);

// ==================== CERTIFICATIONS ====================
router.get('/certifications', authenticateAdmin, getCertifications);
router.post('/certifications', authenticateAdmin, certificationValidations.create, createCertification);
router.put('/certifications/:id', authenticateAdmin, certificationValidations.create, updateCertification);
router.delete('/certifications/:id', authenticateAdmin, deleteCertification);
router.patch('/certifications/:id/toggle', authenticateAdmin, toggleCertificationStatus);
router.get('/certifications/stats', authenticateAdmin, getCertificationStats);

// ==================== TESTIMONIALS ====================
router.get('/testimonials', authenticateAdmin, getTestimonials);
router.post('/testimonials', authenticateAdmin, testimonialValidations.create, createTestimonial);
router.put('/testimonials/:id', authenticateAdmin, testimonialValidations.create, updateTestimonial);
router.delete('/testimonials/:id', authenticateAdmin, deleteTestimonial);
router.patch('/testimonials/:id/verify', authenticateAdmin, verifyTestimonial);
router.patch('/testimonials/:id/feature', authenticateAdmin, featureTestimonial);
router.patch('/testimonials/:id/toggle', authenticateAdmin, toggleTestimonialStatus);
router.get('/testimonials/stats', authenticateAdmin, getTestimonialStats);

export default router;
