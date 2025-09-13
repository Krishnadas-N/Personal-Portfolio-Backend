import { Router } from 'express';
import {
  // Profile & Auth routes
  getProfile,
  updateProfile,
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  
  // Project routes
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  likeProject,
  getFeaturedProjects,
  getProjectsByTechnology,
  getProjectStats,
  
  // Blog routes
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  likeBlog,
  getFeaturedBlogs,
  getBlogsByCategory,
  getBlogCategories,
  getBlogStats,
  
  // Contact routes
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  replyToContact,
  markAsSpam,
  assignContact,
  getContactStats,
  deleteContact,
  
  // Experience routes
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  getCurrentExperiences,
  getExperiencesByCompany,
  getExperienceStats,
  
  // Education routes
  getEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  getCurrentEducation,
  getEducationByInstitution,
  getEducationStats,
  
  // Skills routes
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  getSkillsByLevel,
  getSkillCategories,
  getSkillLevels,
  getSkillStats,
  toggleSkillStatus,
  
  // Certification routes
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
  getCertificationsByIssuer,
  getCertificationsByCategory,
  getRecentCertifications,
  getCertificationStats,
  toggleCertificationStatus,
  
  // Testimonial routes
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getFeaturedTestimonials,
  getVerifiedTestimonials,
  verifyTestimonial,
  featureTestimonial,
  getTestimonialsByCompany,
  getTestimonialStats,
  toggleTestimonialStatus
} from '../controllers';

import {
  authenticateToken,
  authenticateAdmin,
  optionalAuth
} from '../middlewares/auth.middleware';

import {
  userValidations,
  projectValidations,
  blogValidations,
  contactValidations,
  experienceValidations,
  educationValidations,
  skillValidations,
  certificationValidations,
  testimonialValidations
} from '../middlewares/validation';

import {
  cache,
  invalidateCache,
  cachePatterns,
  cacheDurations
} from '../middlewares/cache';

const router = Router();

// Public routes
router.get('/profile', cache(cacheDurations.long), getProfile);

// Project routes
router.get('/projects', cache(cacheDurations.medium), getProjects);
router.get('/projects/featured', cache(cacheDurations.medium), getFeaturedProjects);
router.get('/projects/technology/:tech', cache(cacheDurations.medium), getProjectsByTechnology);
router.get('/projects/:id', cache(cacheDurations.short), getProject);
router.post('/projects/:id/like', likeProject);

// Blog routes
router.get('/blogs', cache(cacheDurations.medium), getBlogs);
router.get('/blogs/featured', cache(cacheDurations.medium), getFeaturedBlogs);
router.get('/blogs/category/:category', cache(cacheDurations.medium), getBlogsByCategory);
router.get('/blogs/categories', cache(cacheDurations.long), getBlogCategories);
router.get('/blogs/:slug', cache(cacheDurations.short), getBlog);
router.post('/blogs/:id/like', likeBlog);

// Experience routes
router.get('/experiences', cache(cacheDurations.long), getExperiences);
router.get('/experiences/current', cache(cacheDurations.long), getCurrentExperiences);
router.get('/experiences/company/:company', cache(cacheDurations.medium), getExperiencesByCompany);
router.get('/experiences/:id', cache(cacheDurations.long), getExperience);

// Education routes
router.get('/education', cache(cacheDurations.long), getEducation);
router.get('/education/current', cache(cacheDurations.long), getCurrentEducation);
router.get('/education/institution/:institution', cache(cacheDurations.medium), getEducationByInstitution);
router.get('/education/:id', cache(cacheDurations.long), getEducationById);

// Skills routes
router.get('/skills', cache(cacheDurations.long), getSkills);
router.get('/skills/category/:category', cache(cacheDurations.long), getSkillsByCategory);
router.get('/skills/level/:level', cache(cacheDurations.long), getSkillsByLevel);
router.get('/skills/categories', cache(cacheDurations.veryLong), getSkillCategories);
router.get('/skills/levels', cache(cacheDurations.veryLong), getSkillLevels);
router.get('/skills/:id', cache(cacheDurations.long), getSkill);

// Certification routes
router.get('/certifications', cache(cacheDurations.long), getCertifications);
router.get('/certifications/recent', cache(cacheDurations.medium), getRecentCertifications);
router.get('/certifications/issuer/:issuer', cache(cacheDurations.medium), getCertificationsByIssuer);
router.get('/certifications/category/:category', cache(cacheDurations.medium), getCertificationsByCategory);
router.get('/certifications/:id', cache(cacheDurations.long), getCertification);

// Testimonial routes
router.get('/testimonials', cache(cacheDurations.medium), getTestimonials);
router.get('/testimonials/featured', cache(cacheDurations.medium), getFeaturedTestimonials);
router.get('/testimonials/verified', cache(cacheDurations.medium), getVerifiedTestimonials);
router.get('/testimonials/company/:company', cache(cacheDurations.medium), getTestimonialsByCompany);
router.get('/testimonials/:id', cache(cacheDurations.long), getTestimonial);

// Contact form (public)
router.post('/contact', contactValidations.create, submitContact);

// Auth routes
router.post('/auth/register', userValidations.register, register);
router.post('/auth/login', userValidations.login, login);
router.post('/auth/logout', authenticateToken, logout);

// Protected user routes
router.get('/auth/me', authenticateToken, getMe);
router.put('/auth/me', authenticateToken, userValidations.updateProfile, updateMe);
router.put('/auth/change-password', authenticateToken, changePassword);

// Admin content management routes
router.post('/projects', authenticateAdmin, projectValidations.create, invalidateCache(cachePatterns.projects), createProject);
router.put('/projects/:id', authenticateAdmin, projectValidations.update, invalidateCache(cachePatterns.projects), updateProject);
router.delete('/projects/:id', authenticateAdmin, invalidateCache(cachePatterns.projects), deleteProject);
router.patch('/projects/:id/archive', authenticateAdmin, invalidateCache(cachePatterns.projects), archiveProject);
router.get('/projects/stats', authenticateAdmin, getProjectStats);

router.post('/blogs', authenticateAdmin, blogValidations.create, invalidateCache(cachePatterns.blogs), createBlog);
router.put('/blogs/:id', authenticateAdmin, blogValidations.create, invalidateCache(cachePatterns.blogs), updateBlog);
router.delete('/blogs/:id', authenticateAdmin, invalidateCache(cachePatterns.blogs), deleteBlog);
router.patch('/blogs/:id/publish', authenticateAdmin, invalidateCache(cachePatterns.blogs), publishBlog);
router.get('/blogs/stats', authenticateAdmin, getBlogStats);

router.get('/contact', authenticateAdmin, getContacts);
router.get('/contact/:id', authenticateAdmin, getContact);
router.patch('/contact/:id/status', authenticateAdmin, updateContactStatus);
router.post('/contact/:id/reply', authenticateAdmin, replyToContact);
router.patch('/contact/:id/spam', authenticateAdmin, markAsSpam);
router.patch('/contact/:id/assign', authenticateAdmin, assignContact);
router.delete('/contact/:id', authenticateAdmin, deleteContact);
router.get('/contact/stats', authenticateAdmin, getContactStats);

router.post('/experiences', authenticateAdmin, experienceValidations.create, createExperience);
router.put('/experiences/:id', authenticateAdmin, experienceValidations.create, updateExperience);
router.delete('/experiences/:id', authenticateAdmin, deleteExperience);
router.get('/experiences/stats', authenticateAdmin, getExperienceStats);

router.post('/education', authenticateAdmin, educationValidations.create, createEducation);
router.put('/education/:id', authenticateAdmin, educationValidations.create, updateEducation);
router.delete('/education/:id', authenticateAdmin, deleteEducation);
router.get('/education/stats', authenticateAdmin, getEducationStats);

router.post('/skills', authenticateAdmin, skillValidations.create, createSkill);
router.put('/skills/:id', authenticateAdmin, skillValidations.create, updateSkill);
router.delete('/skills/:id', authenticateAdmin, deleteSkill);
router.patch('/skills/:id/toggle', authenticateAdmin, toggleSkillStatus);
router.get('/skills/stats', authenticateAdmin, getSkillStats);

router.post('/certifications', authenticateAdmin, certificationValidations.create, createCertification);
router.put('/certifications/:id', authenticateAdmin, certificationValidations.create, updateCertification);
router.delete('/certifications/:id', authenticateAdmin, deleteCertification);
router.patch('/certifications/:id/toggle', authenticateAdmin, toggleCertificationStatus);
router.get('/certifications/stats', authenticateAdmin, getCertificationStats);

router.post('/testimonials', authenticateAdmin, testimonialValidations.create, createTestimonial);
router.put('/testimonials/:id', authenticateAdmin, testimonialValidations.create, updateTestimonial);
router.delete('/testimonials/:id', authenticateAdmin, deleteTestimonial);
router.patch('/testimonials/:id/verify', authenticateAdmin, verifyTestimonial);
router.patch('/testimonials/:id/feature', authenticateAdmin, featureTestimonial);
router.patch('/testimonials/:id/toggle', authenticateAdmin, toggleTestimonialStatus);
router.get('/testimonials/stats', authenticateAdmin, getTestimonialStats);

export default router;
