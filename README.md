# Simple CMS - Blog Management System

A simple and efficient Content Management System (CMS) built with Next.js, React, and PostgreSQL. This CMS focuses on essential blog post management with CRUD operations, WYSIWYG editing, image uploads, and SEO optimization.

## Features

### Core Functionalities
- ✅ **CRUD Operations** - Create, Read, Update, Delete blog posts
- ✅ **WYSIWYG Editor** - Rich text editing capabilities (planned integration with ReactQuill)
- ✅ **Image Uploads** - AWS S3 integration for media storage
- ✅ **SEO Optimization** - SEO titles, descriptions, and meta tags
- ✅ **Draft/Publish System** - Manage post publication status
- ✅ **Author Management** - Multi-user support with roles

### Technical Features
- ✅ **Authentication** - JWT-based user authentication
- ✅ **Role-based Access** - Admin and Author roles
- ✅ **Caching** - Redis integration for performance optimization
- ✅ **Spam Protection** - reCAPTCHA integration (planned)
- ✅ **Responsive Design** - Mobile-friendly admin interface
- ✅ **Type Safety** - Full TypeScript support

## Tech Stack

- **Frontend**: React.js, Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Caching**: Redis
- **Validation**: Zod schemas
- **Rich Text**: ReactQuill (WYSIWYG editor)

## Project Structure

```
simple-cms/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin interface
│   │   │   ├── layout.tsx     # Admin layout
│   │   │   ├── page.tsx       # Dashboard
│   │   │   └── posts/         # Post management
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── posts/         # Post CRUD
│   │   │   └── upload/        # File upload
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/                # UI components
│   │   └── PostEditor.tsx     # Post editor
│   └── lib/                   # Utilities
│       ├── auth.ts            # Authentication
│       ├── prisma.ts          # Database client
│       ├── redis.ts           # Cache client
│       ├── s3.ts              # File upload
│       └── utils.ts           # Helper functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for image uploads)
- Redis instance (optional, for caching)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd simple-cms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/simple_cms"

# Redis (optional - for caching)
REDIS_URL="redis://localhost:6379"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# reCAPTCHA Configuration (optional)
RECAPTCHA_SITE_KEY="your_recaptcha_site_key"
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key"

# NextAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Create Initial Admin User
You'll need to create an admin user manually in the database or through Prisma Studio:

```sql
INSERT INTO users (id, email, password, name, role) 
VALUES (
  'admin-id', 
  'admin@example.com', 
  -- Use bcrypt to hash the password
  '$2a$12$hashedpassword', 
  'Admin User', 
  'ADMIN'
);
```

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Admin Interface
Access the admin interface at `/admin` after logging in.

#### Dashboard
- Overview of post statistics
- Quick access to recent posts
- Navigation to create new posts

#### Post Management
- **Create Posts**: `/admin/posts/new`
- **View All Posts**: `/admin/posts`
- **Edit Posts**: `/admin/posts/[id]/edit`

#### Post Editor Features
- Rich text content editing
- SEO title and description
- Featured image upload
- Draft/Published status toggle
- Author assignment

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login

#### Posts
- `GET /api/posts` - List all posts (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

#### File Upload
- `POST /api/upload` - Upload image to S3

### Query Parameters for Posts API
- `page`: Page number for pagination
- `limit`: Number of posts per page
- `status`: Filter by post status (DRAFT, PUBLISHED)
- `search`: Search in title and content

Example:
```
GET /api/posts?page=1&limit=10&status=PUBLISHED&search=javascript
```

## Database Schema

### Users Table
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Display name
- `role`: ADMIN or AUTHOR
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Posts Table
- `id`: Unique identifier
- `title`: Post title
- `slug`: URL slug (unique)
- `content`: Post content (HTML)
- `excerpt`: Auto-generated excerpt
- `seoTitle`: SEO title
- `seoDescription`: SEO description
- `featuredImage`: Featured image URL
- `status`: DRAFT, PUBLISHED, or ARCHIVED
- `publishedAt`: Publication timestamp
- `authorId`: Reference to user
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Tags Table (Many-to-Many with Posts)
- `id`: Unique identifier
- `name`: Tag name (unique)
- `slug`: Tag slug (unique)

## Deployment

### Environment Setup
1. Set up production database (PostgreSQL)
2. Configure AWS S3 bucket with proper CORS settings
3. Set up Redis instance (optional)
4. Configure environment variables for production

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Recommended Hosting Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

### Database Hosting
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL)
- **AWS RDS**
- **Google Cloud SQL**

## Performance Optimization

### Caching Strategy
- Redis caching for frequently accessed posts
- API response caching
- Image optimization with Next.js Image component

### SEO Features
- Automatic sitemap generation (to be implemented)
- Meta tags optimization
- Structured data markup (to be implemented)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention with Prisma
- File upload validation
- reCAPTCHA integration (planned)

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

### Upcoming Features
- [ ] Advanced WYSIWYG editor with image insertion
- [ ] Category management
- [ ] Comment system
- [ ] Email notifications
- [ ] Advanced search functionality
- [ ] Content scheduling
- [ ] Media library management
- [ ] Theme customization
- [ ] Analytics dashboard
- [ ] Import/Export functionality

### Performance Improvements
- [ ] Server-side rendering optimization
- [ ] Image lazy loading
- [ ] CDN integration
- [ ] Database query optimization

## Troubleshooting

### Common Issues

#### Database Connection
```
Error: Database connection failed
```
- Check DATABASE_URL in environment variables
- Ensure PostgreSQL is running
- Verify database credentials

#### AWS S3 Upload Issues
```
Error: Upload failed
```
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure CORS is configured

#### Build Errors
```
Error: Module not found
```
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript configuration
- Verify import paths

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

---

**Simple CMS** - A streamlined solution for blog content management. 