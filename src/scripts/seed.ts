import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { 
  Admin, 
  User, 
  Skill, 
  Project, 
  Experience, 
  Education, 
  Certification, 
  Blog,
  Testimonial 
} from '../models';
import connectToDatabase from '../config/mongodb';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedData = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    logger.info('Starting database seeding...');

    // Clear existing data
    logger.info('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Education.deleteMany({}),
      Certification.deleteMany({}),
      Blog.deleteMany({}),
      Testimonial.deleteMany({})
    ]);
    logger.info('Existing data cleared!');

    // 1. Create Admin User
    logger.info('Creating admin user...');
    const admin = await Admin.create({
      username: 'admin',
      email: 'krishnadas@admin.com',
      password: 'Admin@123#', // Will be hashed by the pre-save hook
      role: 'super_admin',
      permissions: ['all'],
      isActive: true,
    });
    logger.info(`Admin created: ${admin.email}`);

    // 2. Create Portfolio Owner User
    logger.info('Creating portfolio owner user...');
    const user = await User.create({
      name: 'Krishnadas N',
      email: 'krishnadas@portfolio.com',
      password: 'User@123', // Will be hashed by the pre-save hook
      role: 'admin',
      isActive: true,
      bio: 'Full Stack Developer passionate about creating innovative web solutions',
      location: 'India',
      availability: 'Available for freelance',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/krishnadas', icon: 'github' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/krishnadas', icon: 'linkedin' },
        { platform: 'Twitter', url: 'https://twitter.com/krishnadas', icon: 'twitter' }
      ],
      skills: ['Node.js', 'React', 'TypeScript', 'MongoDB'],
      languages: ['English', 'Hindi', 'Malayalam'],
      interests: ['Web Development', 'Open Source', 'DevOps', 'Machine Learning']
    });
    logger.info(`User created: ${user.email}`);

    // 3. Create Skills
    logger.info('Creating skills...');
    const skills = await Skill.insertMany([
      {
        name: 'JavaScript',
        category: 'technical',
        level: 'expert',
        yearsOfExperience: 5,
        description: 'Advanced knowledge in modern JavaScript (ES6+)',
        icon: 'javascript-icon',
        color: '#F7DF1E',
        isActive: true
      },
      {
        name: 'TypeScript',
        category: 'technical',
        level: 'expert',
        yearsOfExperience: 4,
        description: 'Strong typing and advanced TypeScript patterns',
        icon: 'typescript-icon',
        color: '#3178C6',
        isActive: true
      },
      {
        name: 'Node.js',
        category: 'framework',
        level: 'expert',
        yearsOfExperience: 5,
        description: 'Backend development with Node.js and Express',
        icon: 'nodejs-icon',
        color: '#339933',
        isActive: true
      },
      {
        name: 'React',
        category: 'framework',
        level: 'expert',
        yearsOfExperience: 4,
        description: 'Building modern web applications with React',
        icon: 'react-icon',
        color: '#61DAFB',
        isActive: true
      },
      {
        name: 'MongoDB',
        category: 'technical',
        level: 'advanced',
        yearsOfExperience: 4,
        description: 'NoSQL database design and optimization',
        icon: 'mongodb-icon',
        color: '#47A248',
        isActive: true
      },
      {
        name: 'Docker',
        category: 'tool',
        level: 'advanced',
        yearsOfExperience: 3,
        description: 'Containerization and deployment',
        icon: 'docker-icon',
        color: '#2496ED',
        isActive: true
      },
      {
        name: 'Git',
        category: 'tool',
        level: 'expert',
        yearsOfExperience: 5,
        description: 'Version control and collaboration',
        icon: 'git-icon',
        color: '#F05032',
        isActive: true
      },
      {
        name: 'Problem Solving',
        category: 'soft',
        level: 'expert',
        yearsOfExperience: 5,
        description: 'Analytical thinking and solution design',
        isActive: true
      },
      {
        name: 'Team Collaboration',
        category: 'soft',
        level: 'advanced',
        yearsOfExperience: 4,
        description: 'Working effectively in team environments',
        isActive: true
      },
      {
        name: 'AWS',
        category: 'tool',
        level: 'intermediate',
        yearsOfExperience: 2,
        description: 'Cloud services and deployment on AWS',
        icon: 'aws-icon',
        color: '#FF9900',
        isActive: true
      }
    ]);
    logger.info(`${skills.length} skills created`);

    // 4. Create Projects
    logger.info('Creating projects...');
    const projects = await Project.insertMany([
      {
        title: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform with payment integration, inventory management, and admin dashboard',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
        link: 'https://ecommerce-demo.com',
        repo: 'https://github.com/krishnadas/ecommerce',
        images: ['project1-img1.jpg', 'project1-img2.jpg'],
        skills: ['React', 'Node.js', 'MongoDB'],
        projectType: 'main',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-06-30'),
        current: false,
        featured: true,
        status: 'Completed',
        viewsCount: 150,
        likes: 45,
        tags: ['e-commerce', 'full-stack', 'payment-integration'],
        license: 'MIT',
        deploymentDetails: [
          { platform: 'AWS EC2', url: 'https://ecommerce-demo.com' }
        ],
        seoKeywords: ['ecommerce', 'online shopping', 'web application']
      },
      {
        title: 'Real-time Chat Application',
        description: 'A real-time messaging application with group chats, file sharing, and video calling features',
        technologies: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'WebRTC'],
        link: 'https://chat-app-demo.com',
        repo: 'https://github.com/krishnadas/chat-app',
        images: ['project2-img1.jpg'],
        skills: ['React', 'Socket.io', 'Node.js'],
        projectType: 'main',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-10-15'),
        current: false,
        featured: true,
        status: 'Completed',
        viewsCount: 200,
        likes: 67,
        tags: ['real-time', 'chat', 'webrtc'],
        license: 'MIT',
        deploymentDetails: [
          { platform: 'Heroku', url: 'https://chat-app-demo.com' }
        ]
      },
      {
        title: 'Portfolio Website Builder',
        description: 'A drag-and-drop portfolio website builder for developers and designers',
        technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'Prisma', 'PostgreSQL'],
        link: 'https://portfolio-builder.com',
        repo: 'https://github.com/krishnadas/portfolio-builder',
        images: ['project3-img1.jpg'],
        skills: ['TypeScript', 'React', 'Next.js'],
        projectType: 'main',
        startDate: new Date('2024-01-10'),
        current: true,
        featured: true,
        status: 'In Progress',
        viewsCount: 89,
        likes: 32,
        tags: ['portfolio', 'no-code', 'website-builder']
      },
      {
        title: 'Weather Dashboard',
        description: 'A simple weather dashboard showing forecasts and weather data',
        technologies: ['React', 'OpenWeather API', 'Chart.js'],
        link: 'https://weather-dashboard-demo.com',
        repo: 'https://github.com/krishnadas/weather-dashboard',
        images: [],
        skills: ['React', 'APIs'],
        projectType: 'mini',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2023-11-15'),
        current: false,
        featured: false,
        status: 'Completed',
        viewsCount: 45,
        likes: 12,
        tags: ['weather', 'api', 'dashboard']
      }
    ]);
    logger.info(`${projects.length} projects created`);

    // 5. Create Experience
    logger.info('Creating experience records...');
    const experiences = await Experience.insertMany([
      {
        company: 'Tech Solutions Inc.',
        position: 'Senior Full Stack Developer',
        location: 'San Francisco, CA (Remote)',
        startDate: new Date('2022-03-01'),
        isCurrent: true,
        description: 'Leading full-stack development projects and mentoring junior developers',
        responsibilities: [
          'Architecting and developing scalable web applications',
          'Leading a team of 5 developers',
          'Code review and ensuring best practices',
          'Implementing CI/CD pipelines'
        ],
        achievements: [
          'Reduced application load time by 40%',
          'Successfully led migration to microservices architecture',
          'Implemented automated testing reducing bugs by 60%'
        ],
        skills: ['Node.js', 'React', 'AWS', 'Docker', 'MongoDB'],
        companyWebsite: 'https://techsolutions.com',
        employmentType: 'full-time',
        industry: 'Technology',
        teamSize: 15
      },
      {
        company: 'StartUp Ventures',
        position: 'Full Stack Developer',
        location: 'New York, NY',
        startDate: new Date('2020-06-15'),
        endDate: new Date('2022-02-28'),
        isCurrent: false,
        description: 'Developed and maintained multiple client projects',
        responsibilities: [
          'Building responsive web applications',
          'Collaborating with designers and backend teams',
          'Database design and optimization',
          'API development and integration'
        ],
        achievements: [
          'Delivered 10+ successful projects',
          'Improved code quality through implementation of testing frameworks',
          'Mentored 3 junior developers'
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
        companyWebsite: 'https://startupventures.com',
        employmentType: 'full-time',
        industry: 'Technology',
        teamSize: 8
      },
      {
        company: 'Freelance',
        position: 'Web Developer',
        location: 'Remote',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2020-06-01'),
        isCurrent: false,
        description: 'Worked with various clients on web development projects',
        responsibilities: [
          'Building custom websites and web applications',
          'Client communication and requirement gathering',
          'Project management and delivery'
        ],
        achievements: [
          'Successfully completed 20+ client projects',
          'Maintained 5-star rating on freelance platforms',
          'Built long-term relationships with recurring clients'
        ],
        skills: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'React'],
        employmentType: 'freelance',
        industry: 'Various'
      }
    ]);
    logger.info(`${experiences.length} experience records created`);

    // 6. Create Education
    logger.info('Creating education records...');
    const educations = await Education.insertMany([
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science and Engineering',
        startDate: new Date('2015-08-01'),
        endDate: new Date('2019-05-30'),
        gpa: 3.8,
        description: 'Focused on software engineering, algorithms, and web technologies',
        activities: ['Coding Club President', 'Tech Fest Organizer'],
        achievements: [
          'Dean\'s List - All Semesters',
          'Winner of University Hackathon 2018',
          'Published research paper on Machine Learning'
        ],
        location: 'California, USA',
        isCurrent: false,
        website: 'https://universityoftech.edu'
      },
      {
        institution: 'Online Learning Platform',
        degree: 'Full Stack Web Development Bootcamp',
        fieldOfStudy: 'Web Development',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2019-12-31'),
        description: 'Intensive bootcamp covering MERN stack development',
        achievements: [
          'Graduated with Honors',
          'Built 5 full-stack projects',
          'Received job-ready certification'
        ],
        location: 'Online',
        isCurrent: false
      }
    ]);
    logger.info(`${educations.length} education records created`);

    // 7. Create Certifications
    logger.info('Creating certifications...');
    const certifications = await Certification.insertMany([
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: new Date('2023-03-15'),
        expiryDate: new Date('2026-03-15'),
        credentialId: 'AWS-CSA-2023-001234',
        credentialUrl: 'https://aws.amazon.com/verification/001234',
        skills: ['AWS', 'Cloud Architecture', 'DevOps'],
        category: 'Cloud Computing',
        level: 'advanced',
        verificationUrl: 'https://aws.amazon.com/verify',
        isActive: true
      },
      {
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        issueDate: new Date('2022-08-20'),
        credentialId: 'MONGO-DEV-2022-5678',
        credentialUrl: 'https://university.mongodb.com/certification/5678',
        skills: ['MongoDB', 'Database Design', 'NoSQL'],
        category: 'Database',
        level: 'advanced',
        isActive: true
      },
      {
        name: 'React - The Complete Guide',
        issuer: 'Udemy',
        issueDate: new Date('2021-11-10'),
        credentialId: 'UC-REACT-001122',
        credentialUrl: 'https://udemy.com/certificate/UC-REACT-001122',
        skills: ['React', 'JavaScript', 'Frontend Development'],
        category: 'Web Development',
        level: 'expert',
        isActive: true
      },
      {
        name: 'Docker Certified Associate',
        issuer: 'Docker Inc.',
        issueDate: new Date('2023-06-05'),
        expiryDate: new Date('2025-06-05'),
        credentialId: 'DCA-2023-9012',
        skills: ['Docker', 'Containerization', 'DevOps'],
        category: 'DevOps',
        level: 'intermediate',
        isActive: true
      }
    ]);
    logger.info(`${certifications.length} certifications created`);

    // 8. Create Blog Posts
    logger.info('Creating blog posts...');
    const blogs = await Blog.insertMany([
      {
        title: 'Getting Started with Node.js and Express',
        slug: 'getting-started-nodejs-express',
        content: `
# Getting Started with Node.js and Express

Node.js has revolutionized backend development, and Express.js makes it even easier to build robust web applications. In this comprehensive guide, we'll explore how to get started with these powerful technologies.

## What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server-side, enabling full-stack JavaScript development.

## Why Express?

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

## Setting Up Your First Server

Here's a simple example:

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Conclusion

Node.js and Express provide a powerful foundation for building scalable web applications. This is just the beginning of your journey!
        `.trim(),
        excerpt: 'Learn how to build your first web server using Node.js and Express in this beginner-friendly guide.',
        author: user._id,
        tags: ['Node.js', 'Express', 'JavaScript', 'Backend', 'Tutorial'],
        category: 'Web Development',
        status: 'published',
        publishedAt: new Date('2024-01-15'),
        viewsCount: 350,
        likes: 45,
        seoTitle: 'Getting Started with Node.js and Express - Complete Guide',
        seoDescription: 'A comprehensive guide for beginners to start building web applications with Node.js and Express.',
        isFeatured: true
      },
      {
        title: 'Understanding React Hooks: A Deep Dive',
        slug: 'understanding-react-hooks-deep-dive',
        content: `
# Understanding React Hooks: A Deep Dive

React Hooks have transformed how we write React components. Let's explore the most commonly used hooks and best practices.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

## useState Hook

The useState hook allows you to add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

## useEffect Hook

useEffect lets you perform side effects in function components:

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Best Practices

1. Always call hooks at the top level
2. Only call hooks from React functions
3. Use custom hooks for reusable logic

## Conclusion

React Hooks provide a more elegant way to manage state and side effects in your applications.
        `.trim(),
        excerpt: 'Explore React Hooks in depth, including useState, useEffect, and custom hooks with practical examples.',
        author: user._id,
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks', 'Tutorial'],
        category: 'Frontend Development',
        status: 'published',
        publishedAt: new Date('2024-02-01'),
        viewsCount: 520,
        likes: 89,
        seoTitle: 'React Hooks Complete Guide - useState, useEffect & More',
        seoDescription: 'Master React Hooks with this comprehensive guide covering all essential hooks and best practices.',
        isFeatured: true
      },
      {
        title: 'MongoDB vs SQL: Choosing the Right Database',
        slug: 'mongodb-vs-sql-choosing-right-database',
        content: `
# MongoDB vs SQL: Choosing the Right Database

Choosing between MongoDB and SQL databases is one of the most important decisions in your application architecture. Let's compare them.

## MongoDB (NoSQL)

MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents.

### Pros:
- Flexible schema
- Horizontal scalability
- Fast for read-heavy workloads
- Great for unstructured data

### Cons:
- No ACID transactions (in older versions)
- Requires more storage
- Complex joins can be challenging

## SQL Databases

SQL databases use structured tables with predefined schemas and relationships.

### Pros:
- ACID compliance
- Complex queries and joins
- Data integrity
- Mature ecosystem

### Cons:
- Rigid schema
- Vertical scaling limitations
- Can be slower for certain operations

## When to Choose MongoDB

- Rapid development with changing requirements
- Handling large volumes of unstructured data
- Need for horizontal scalability
- Real-time analytics

## When to Choose SQL

- Complex transactions
- Need for strong consistency
- Complex relationships between data
- Structured, predictable data

## Conclusion

Both databases have their strengths. Choose based on your specific use case, scalability needs, and data structure.
        `.trim(),
        excerpt: 'A comprehensive comparison between MongoDB and SQL databases to help you make the right choice for your project.',
        author: user._id,
        tags: ['MongoDB', 'SQL', 'Database', 'Backend', 'Architecture'],
        category: 'Database',
        status: 'published',
        publishedAt: new Date('2024-03-10'),
        viewsCount: 280,
        likes: 54,
        seoTitle: 'MongoDB vs SQL: Complete Database Comparison Guide',
        seoDescription: 'Compare MongoDB and SQL databases to choose the right one for your application needs.',
        isFeatured: false
      },
      {
        title: 'Building RESTful APIs with Best Practices',
        slug: 'building-restful-apis-best-practices',
        content: `
# Building RESTful APIs with Best Practices

REST APIs are the backbone of modern web applications. Let's explore how to build them the right way.

## REST Principles

1. **Stateless**: Each request contains all necessary information
2. **Client-Server**: Separation of concerns
3. **Cacheable**: Responses should define themselves as cacheable or not
4. **Uniform Interface**: Consistent API design

## API Design Best Practices

### Use Proper HTTP Methods

- GET: Retrieve data
- POST: Create new resource
- PUT/PATCH: Update existing resource
- DELETE: Remove resource

### Use Meaningful Endpoints

\`\`\`
Good: GET /api/users/123
Bad: GET /api/getUser?id=123
\`\`\`

### Version Your API

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

### Handle Errors Properly

Return appropriate status codes and error messages:

\`\`\`javascript
{
  "error": {
    "code": 404,
    "message": "User not found"
  }
}
\`\`\`

## Security

- Use HTTPS
- Implement authentication (JWT, OAuth)
- Validate and sanitize input
- Rate limiting

## Documentation

Always document your API using tools like Swagger/OpenAPI.

## Conclusion

Following these best practices will help you build robust, scalable, and maintainable REST APIs.
        `.trim(),
        excerpt: 'Learn the best practices for building RESTful APIs including design patterns, security, and documentation.',
        author: user._id,
        tags: ['API', 'REST', 'Backend', 'Best Practices', 'Tutorial'],
        category: 'Backend Development',
        status: 'published',
        publishedAt: new Date('2024-04-05'),
        viewsCount: 410,
        likes: 72,
        seoTitle: 'RESTful API Best Practices - Complete Guide',
        seoDescription: 'Master REST API development with this guide covering design, security, and documentation best practices.',
        isFeatured: true
      }
    ]);
    logger.info(`${blogs.length} blog posts created`);

    // 9. Create Testimonials
    logger.info('Creating testimonials...');
    const testimonials = await Testimonial.insertMany([
      {
        clientName: 'John Smith',
        clientPosition: 'CEO',
        clientCompany: 'Tech Innovations Inc.',
        content: 'Working with Krishnadas was an absolute pleasure. He delivered our e-commerce platform ahead of schedule and exceeded all our expectations. His technical expertise and problem-solving skills are outstanding.',
        rating: 5,
        project: projects[0]._id,
        isActive: true,
        isFeatured: true,
        clientEmail: 'john.smith@techinnovations.com',
        clientLinkedIn: 'https://linkedin.com/in/johnsmith',
        verified: true,
        verifiedAt: new Date('2023-07-15')
      },
      {
        clientName: 'Sarah Johnson',
        clientPosition: 'Product Manager',
        clientCompany: 'StartUp Ventures',
        content: 'The chat application developed by Krishnadas has transformed how our team communicates. The real-time features work flawlessly, and the code quality is exceptional. Highly recommended!',
        rating: 5,
        project: projects[1]._id,
        isActive: true,
        isFeatured: true,
        clientEmail: 'sarah.j@startupventures.com',
        clientLinkedIn: 'https://linkedin.com/in/sarahjohnson',
        verified: true,
        verifiedAt: new Date('2023-11-01')
      },
      {
        clientName: 'Michael Chen',
        clientPosition: 'CTO',
        clientCompany: 'Digital Solutions Ltd.',
        content: 'Krishnadas is a talented developer with a keen eye for detail. He helped us migrate our legacy system to a modern architecture, and the results have been fantastic. Great communication throughout the project.',
        rating: 5,
        isActive: true,
        isFeatured: true,
        clientEmail: 'michael.chen@digitalsolutions.com',
        verified: true,
        verifiedAt: new Date('2024-01-20')
      },
      {
        clientName: 'Emily Rodriguez',
        clientPosition: 'Marketing Director',
        clientCompany: 'Creative Agency Co.',
        content: 'Professional, skilled, and reliable. Krishnadas built our company website and it looks amazing! He was patient with our requests and delivered exactly what we wanted.',
        rating: 5,
        isActive: true,
        isFeatured: false,
        clientEmail: 'emily.r@creativeagency.com',
        verified: true,
        verifiedAt: new Date('2024-02-10')
      },
      {
        clientName: 'David Park',
        clientPosition: 'Senior Developer',
        clientCompany: 'Tech Corp',
        content: 'I had the pleasure of working alongside Krishnadas on a complex project. His expertise in full-stack development and his collaborative approach made the project a success. Would love to work with him again.',
        rating: 5,
        isActive: true,
        isFeatured: false,
        clientLinkedIn: 'https://linkedin.com/in/davidpark',
        verified: true,
        verifiedAt: new Date('2024-03-05')
      }
    ]);
    logger.info(`${testimonials.length} testimonials created`);

    // Log summary
    logger.info('====================================');
    logger.info('Database seeding completed successfully!');
    logger.info('====================================');
    logger.info('Summary:');
    logger.info(`- Admins: 1`);
    logger.info(`- Users: 1`);
    logger.info(`- Skills: ${skills.length}`);
    logger.info(`- Projects: ${projects.length}`);
    logger.info(`- Experiences: ${experiences.length}`);
    logger.info(`- Education: ${educations.length}`);
    logger.info(`- Certifications: ${certifications.length}`);
    logger.info(`- Blog Posts: ${blogs.length}`);
    logger.info(`- Testimonials: ${testimonials.length}`);
    logger.info('====================================');
    logger.info('Default Credentials:');
    logger.info('Admin - Email: admin@portfolio.com, Password: Admin@123');
    logger.info('User - Email: krishnadas@portfolio.com, Password: User@123');
    logger.info('====================================');

  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedData();
