import request from 'supertest';
import app from '../src/app';
import connectToDatabase from '../src/config/mongodb';
import { redisClient } from '../src/config/redis';
import User from '../src/models/User';
import Project from '../src/models/Project';
import Blog from '../src/models/Blog';
import Contact from '../src/models/Contact';
import Experience from '../src/models/Experience';
import Education from '../src/models/Education';
import Skill from '../src/models/Skill';
import Certification from '../src/models/Certification';
import Testimonial from '../src/models/Testimonial';
import Admin from '../src/models/Admin';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  role: 'user'
};

const testAdmin = {
  username: 'testadmin',
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  role: 'admin'
};

const testProject = {
  title: 'Test Project',
  description: 'A test project description',
  technologies: ['React', 'Node.js'],
  skills: ['JavaScript', 'TypeScript'],
  projectType: 'main',
  startDate: '2023-01-01',
  status: 'Completed'
};

const testBlog = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content with more than 100 characters to meet the validation requirements.',
  excerpt: 'A test blog post excerpt',
  category: 'Technology',
  tags: ['test', 'blog'],
  status: 'published'
};

const testContact = {
  name: 'Test Contact',
  email: 'contact@example.com',
  subject: 'Test Subject',
  message: 'This is a test message for the contact form.'
};

const testExperience = {
  company: 'Test Company',
  position: 'Test Position',
  startDate: '2023-01-01',
  description: 'Test experience description',
  responsibilities: ['Test responsibility'],
  achievements: ['Test achievement'],
  skills: ['Test skill'],
  employmentType: 'full-time'
};

const testEducation = {
  institution: 'Test University',
  degree: 'Bachelor of Science',
  fieldOfStudy: 'Computer Science',
  startDate: '2020-01-01',
  endDate: '2024-01-01',
  gpa: 3.5
};

const testSkill = {
  name: 'Test Skill',
  category: 'technical',
  level: 'intermediate',
  yearsOfExperience: 2,
  description: 'A test skill description'
};

const testCertification = {
  name: 'Test Certification',
  issuer: 'Test Issuer',
  issueDate: '2023-01-01',
  category: 'Technology',
  level: 'intermediate',
  description: 'A test certification'
};

const testTestimonial = {
  clientName: 'Test Client',
  clientPosition: 'Test Position',
  clientCompany: 'Test Company',
  content: 'This is a test testimonial content with more than 20 characters.',
  rating: 5
};

describe('Portfolio API Tests', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let projectId: string;
  let blogId: string;
  let contactId: string;
  let experienceId: string;
  let educationId: string;
  let skillId: string;
  let certificationId: string;
  let testimonialId: string;

  beforeAll(async () => {
    await connectToDatabase();
    if (redisClient && !redisClient.isOpen) {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    if (redisClient?.isOpen) {
      await redisClient.quit();
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /test/ } });
    await Project.deleteMany({ title: { $regex: /test/i } });
    await Blog.deleteMany({ title: { $regex: /test/i } });
    await Contact.deleteMany({ email: { $regex: /test/ } });
    await Experience.deleteMany({ company: { $regex: /test/i } });
    await Education.deleteMany({ institution: { $regex: /test/i } });
    await Skill.deleteMany({ name: { $regex: /test/i } });
    await Certification.deleteMany({ name: { $regex: /test/i } });
    await Testimonial.deleteMany({ clientName: { $regex: /test/i } });
    await Admin.deleteMany({ email: { $regex: /test/ } });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.token).toBeDefined();
        
        authToken = response.body.data.token;
        userId = response.body.data.user.id;
      });

      it('should not register user with invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...testUser, email: 'invalid-email' })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should not register user with weak password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...testUser, password: '123' })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send(testUser);
      });

      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      it('should not login with invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Profile', () => {
    describe('GET /api/profile', () => {
      it('should get profile information', async () => {
        const response = await request(app)
          .get('/api/profile')
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Projects', () => {
    describe('GET /api/projects', () => {
      it('should get all projects', async () => {
        const response = await request(app)
          .get('/api/projects')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter projects by type', async () => {
        const response = await request(app)
          .get('/api/projects?type=main')
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/projects', () => {
      beforeEach(async () => {
        // Create admin user for testing
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new project', async () => {
        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testProject)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(testProject.title);
        
        projectId = response.body.data._id;
      });

      it('should not create project without authentication', async () => {
        const response = await request(app)
          .post('/api/projects')
          .send(testProject)
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/projects/:id', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;

        const projectResponse = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testProject);
        projectId = projectResponse.body.data._id;
      });

      it('should get a single project', async () => {
        const response = await request(app)
          .get(`/api/projects/${projectId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(testProject.title);
      });

      it('should increment view count', async () => {
        const response1 = await request(app)
          .get(`/api/projects/${projectId}`)
          .expect(200);

        const response2 = await request(app)
          .get(`/api/projects/${projectId}`)
          .expect(200);

        expect(response2.body.data.viewsCount).toBeGreaterThan(response1.body.data.viewsCount);
      });
    });
  });

  describe('Blogs', () => {
    describe('GET /api/blogs', () => {
      it('should get all blogs', async () => {
        const response = await request(app)
          .get('/api/blogs')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/blogs', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new blog post', async () => {
        const response = await request(app)
          .post('/api/blogs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testBlog)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(testBlog.title);
        
        blogId = response.body.data._id;
      });
    });
  });

  describe('Contact', () => {
    describe('POST /api/contact', () => {
      it('should submit contact form', async () => {
        const response = await request(app)
          .post('/api/contact')
          .send(testContact)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Thank you');
        
        contactId = response.body.data.id;
      });

      it('should not submit contact form with invalid data', async () => {
        const response = await request(app)
          .post('/api/contact')
          .send({ name: 'Test' }) // Missing required fields
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/contact', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;

        await request(app)
          .post('/api/contact')
          .send(testContact);
      });

      it('should get all contacts (admin only)', async () => {
        const response = await request(app)
          .get('/api/contact')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });
  });

  describe('Experiences', () => {
    describe('GET /api/experiences', () => {
      it('should get all experiences', async () => {
        const response = await request(app)
          .get('/api/experiences')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/experiences', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new experience', async () => {
        const response = await request(app)
          .post('/api/experiences')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testExperience)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.company).toBe(testExperience.company);
        
        experienceId = response.body.data._id;
      });
    });
  });

  describe('Education', () => {
    describe('GET /api/education', () => {
      it('should get all education records', async () => {
        const response = await request(app)
          .get('/api/education')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/education', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new education record', async () => {
        const response = await request(app)
          .post('/api/education')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testEducation)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.institution).toBe(testEducation.institution);
        
        educationId = response.body.data._id;
      });
    });
  });

  describe('Skills', () => {
    describe('GET /api/skills', () => {
      it('should get all skills', async () => {
        const response = await request(app)
          .get('/api/skills')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/skills', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new skill', async () => {
        const response = await request(app)
          .post('/api/skills')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testSkill)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(testSkill.name);
        
        skillId = response.body.data._id;
      });
    });
  });

  describe('Certifications', () => {
    describe('GET /api/certifications', () => {
      it('should get all certifications', async () => {
        const response = await request(app)
          .get('/api/certifications')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/certifications', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new certification', async () => {
        const response = await request(app)
          .post('/api/certifications')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testCertification)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(testCertification.name);
        
        certificationId = response.body.data._id;
      });
    });
  });

  describe('Testimonials', () => {
    describe('GET /api/testimonials', () => {
      it('should get all testimonials', async () => {
        const response = await request(app)
          .get('/api/testimonials')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/testimonials', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should create a new testimonial', async () => {
        const response = await request(app)
          .post('/api/testimonials')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testTestimonial)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.clientName).toBe(testTestimonial.clientName);
        
        testimonialId = response.body.data._id;
      });
    });
  });

  describe('Admin', () => {
    describe('POST /api/admin/login', () => {
      beforeEach(async () => {
        await Admin.create(testAdmin);
      });

      it('should login admin with valid credentials', async () => {
        const response = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        
        adminToken = response.body.data.token;
      });
    });

    describe('GET /api/admin/dashboard', () => {
      beforeEach(async () => {
        const admin = await Admin.create(testAdmin);
        const loginResponse = await request(app)
          .post('/api/admin/login')
          .send({
            email: testAdmin.email,
            password: testAdmin.password
          });
        adminToken = loginResponse.body.data.token;
      });

      it('should get dashboard stats', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.overview).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for protected routes without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
