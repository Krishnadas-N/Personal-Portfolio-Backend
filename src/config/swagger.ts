import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Portfolio Backend API',
      version: '1.0.0',
      description: 'A comprehensive backend API for personal portfolio management',
      contact: {
        name: 'Krishnadas N',
        email: 'krishnadas@example.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'user'] },
            isActive: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            profileImage: { type: 'string' },
            socialLinks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  url: { type: 'string' },
                  icon: { type: 'string' }
                }
              }
            },
            skills: { type: 'array', items: { type: 'string' } },
            languages: { type: 'array', items: { type: 'string' } },
            interests: { type: 'array', items: { type: 'string' } },
            availability: { type: 'string' },
            location: { type: 'string' },
            bio: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            link: { type: 'string' },
            repo: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            projectType: { type: 'string', enum: ['main', 'mini'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            current: { type: 'boolean' },
            skills: { type: 'array', items: { type: 'string' } },
            featured: { type: 'boolean' },
            collaborators: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['Planning', 'In Progress', 'Completed'] },
            viewsCount: { type: 'number' },
            likes: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            archived: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Blog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string' },
            author: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' },
            featuredImage: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            publishedAt: { type: 'string', format: 'date-time' },
            viewsCount: { type: 'number' },
            likes: { type: 'number' },
            readingTime: { type: 'number' },
            isFeatured: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            subject: { type: 'string' },
            message: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            status: { type: 'string', enum: ['new', 'read', 'replied', 'closed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            source: { type: 'string', enum: ['website', 'email', 'phone', 'social'] },
            tags: { type: 'array', items: { type: 'string' } },
            isSpam: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Include enhancedSwagger.ts in the apis list
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/config/enhancedSwagger.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Portfolio API Documentation'
  }));
};

export default specs;
