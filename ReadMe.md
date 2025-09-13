# Personal Portfolio Backend

A comprehensive, production-ready backend API for personal portfolio management built with Node.js, Express.js, TypeScript, MongoDB, and Redis.

## 🚀 Features

### Core Features
- **Complete CRUD Operations** for all portfolio entities
- **Role-based Access Control** (Admin/User roles)
- **JWT Authentication** with refresh tokens
- **Request Validation** using express-validator
- **Caching** with Redis for improved performance
- **Rate Limiting** to prevent abuse
- **Security Middleware** (Helmet, CORS, XSS protection)
- **Error Handling** with custom error classes
- **API Documentation** with Swagger/OpenAPI
- **Comprehensive Testing** with Jest and Supertest
- **Email Notifications** for contact forms
- **File Upload Support** (ready for cloud storage)
- **Real-time Features** with Socket.io
- **Monitoring & Logging** capabilities

### Portfolio Entities
- **Profile Management** - Personal information and social links
- **Projects** - Portfolio projects with filtering and search
- **Blog Posts** - Content management with categories and tags
- **Experience** - Work experience and career history
- **Education** - Academic background and certifications
- **Skills** - Technical and soft skills with proficiency levels
- **Certifications** - Professional certifications and achievements
- **Testimonials** - Client feedback and reviews
- **Contact Management** - Contact form submissions and responses

### Admin Features
- **Dashboard** with comprehensive statistics
- **User Management** - Create, update, delete users
- **Content Management** - Full CRUD for all entities
- **Contact Management** - Handle inquiries and responses
- **Analytics** - Detailed statistics and insights
- **System Monitoring** - Health checks and performance metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Process Management**: PM2 (for production)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krishnadas-N/Personal-Portfolio-Backend.git
   cd Personal-Portfolio-Backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your actual configuration values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/portfolio-backend
   REDIS_URL=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   # ... other configuration values
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Run tests**
   ```bash
   pnpm test
   ```

6. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:5000/api-docs`

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user
- `PUT /api/auth/change-password` - Change password

#### Profile
- `GET /api/profile` - Get public profile
- `PUT /api/profile` - Update profile (Admin only)

#### Projects
- `GET /api/projects` - Get all projects (with filtering)
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `POST /api/projects/:id/like` - Like project

#### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/featured` - Get featured blogs
- `GET /api/blogs/:slug` - Get single blog
- `POST /api/blogs` - Create blog (Admin only)
- `PUT /api/blogs/:id` - Update blog (Admin only)
- `DELETE /api/blogs/:id` - Delete blog (Admin only)

#### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (Admin only)
- `GET /api/contact/:id` - Get single contact (Admin only)
- `PATCH /api/contact/:id/status` - Update contact status (Admin only)
- `POST /api/contact/:id/reply` - Reply to contact (Admin only)

#### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/User)
- Password hashing with bcrypt
- Session management with Redis

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Request validation and sanitization

### Data Protection
- Password strength requirements
- Email validation
- SQL injection prevention
- Input sanitization
- Secure session configuration

## 🚀 Performance Features

### Caching
- Redis-based caching for frequently accessed data
- Configurable cache durations
- Cache invalidation on data updates
- Smart caching strategies

### Optimization
- Response compression
- Database query optimization
- Pagination for large datasets
- Efficient data aggregation

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking and reporting
- Request logging

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test tests/api.test.ts
```

### Test Coverage
- **API Endpoints**: All routes tested
- **Authentication**: Login, registration, JWT validation
- **CRUD Operations**: Create, read, update, delete operations
- **Validation**: Input validation and error handling
- **Security**: Authentication and authorization
- **Error Handling**: Custom error responses

## 📊 Database Schema

### Models Overview
- **User**: User accounts and profiles
- **Admin**: Admin accounts and permissions
- **Project**: Portfolio projects
- **Blog**: Blog posts and articles
- **Contact**: Contact form submissions
- **Experience**: Work experience
- **Education**: Academic background
- **Skill**: Skills and competencies
- **Certification**: Professional certifications
- **Testimonial**: Client testimonials

### Relationships
- Projects can be related to other projects
- Blogs have authors and related posts
- Skills are linked to projects and certifications
- Testimonials can be associated with projects

## 🔧 Configuration

### Environment Variables
All configuration is managed through environment variables. See `.env.example` for a complete list of available options.

### Key Configuration Areas
- **Database**: MongoDB connection settings
- **Cache**: Redis configuration
- **Security**: JWT secrets and security settings
- **Email**: SMTP configuration for notifications
- **File Upload**: Cloud storage settings
- **Monitoring**: Logging and metrics configuration

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   MONGO_URI=your-production-mongodb-uri
   REDIS_URL=your-production-redis-url
   JWT_SECRET=your-production-jwt-secret
   # ... other production settings
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name portfolio-backend
   pm2 startup
   pm2 save
   ```

### Docker Deployment
```bash
# Build Docker image
docker build -t portfolio-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment-Specific Configurations
- **Development**: Hot reload, detailed logging
- **Staging**: Production-like with debugging
- **Production**: Optimized performance, minimal logging

## 📈 Monitoring & Maintenance

### Health Checks
- `GET /health` - Basic health check
- Database connectivity monitoring
- Redis connectivity monitoring
- External service health checks

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics logging
- Security event logging

### Backup Strategy
- Database backup automation
- Configuration backup
- Log rotation and archival

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krishnadas N**
- GitHub: [@Krishnadas-N](https://github.com/Krishnadas-N)
- Email: krishnadas@example.com

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- Redis team for caching
- All open-source contributors

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact me via email
- Check the documentation

---

**Happy Coding! 🚀**