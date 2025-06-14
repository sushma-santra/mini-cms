# Deployment Guide for Simple CMS

This guide covers deploying your Simple CMS to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- A PostgreSQL database (production)
- AWS S3 bucket configured
- Redis instance (optional but recommended)
- Environment variables configured

## Platform-Specific Deployment

### 1. Vercel (Recommended)

Vercel provides excellent Next.js support with automatic deployments.

#### Steps:
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your_postgresql_url
   REDIS_URL=your_redis_url
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_bucket_name
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Database Setup**
   ```bash
   # Run migrations on production database
   npx prisma migrate deploy
   
   # Create admin user
   ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=securepassword npm run setup:admin
   ```

#### Database Options for Vercel:
- **Supabase** (recommended)
- **Railway**
- **PlanetScale**
- **Neon**

### 2. Railway

Railway offers simple deployment with built-in PostgreSQL.

#### Steps:
1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Add PostgreSQL service

2. **Configure Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_bucket_name
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.railway.app
   ```

3. **Deploy**
   Railway will automatically build and deploy your app.

### 3. DigitalOcean App Platform

#### Steps:
1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your repository
   - Choose Node.js runtime

2. **Configure Build Settings**
   ```yaml
   # .do/app.yaml
   name: simple-cms
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/simple-cms
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: DATABASE_URL
       value: your_database_url
     # Add other environment variables
   ```

### 4. Heroku

#### Steps:
1. **Install Heroku CLI**
   ```bash
   # Create Heroku app
   heroku create your-cms-app
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Add Redis addon (optional)
   heroku addons:create heroku-redis:hobby-dev
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NEXTAUTH_SECRET=your_secret
   heroku config:set AWS_ACCESS_KEY_ID=your_key
   heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
   heroku config:set AWS_REGION=your_region
   heroku config:set AWS_S3_BUCKET=your_bucket
   ```

3. **Deploy**
   ```bash
   git push heroku main
   
   # Run database migrations
   heroku run npx prisma migrate deploy
   
   # Create admin user
   heroku run npm run setup:admin
   ```

## Database Setup

### PostgreSQL Configuration

#### Supabase (Recommended)
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Add to environment variables as `DATABASE_URL`

#### Railway PostgreSQL
1. Add PostgreSQL service in Railway
2. Use the provided `DATABASE_URL` environment variable

#### AWS RDS
1. Create PostgreSQL instance in AWS RDS
2. Configure security groups for access
3. Create connection string:
   ```
   postgresql://username:password@hostname:5432/database_name
   ```

### Redis Setup (Optional)

#### Railway Redis
1. Add Redis service in Railway
2. Use the provided `REDIS_URL`

#### Upstash
1. Create account at [Upstash](https://upstash.com)
2. Create Redis database
3. Copy connection URL

## AWS S3 Configuration

### Bucket Setup
1. Create S3 bucket in AWS Console
2. Configure bucket policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

### IAM User Policy
Create IAM user with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Post-Deployment Steps

### 1. Database Migration
```bash
# For production database
npx prisma migrate deploy
```

### 2. Create Admin User
```bash
# Set environment variables and run
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=securepassword npm run setup:admin
```

### 3. Verify Deployment
- [ ] Application loads successfully
- [ ] Admin login works
- [ ] Database connection established
- [ ] File upload to S3 works
- [ ] Redis connection (if configured)

### 4. Security Checklist
- [ ] Change default admin password
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure CSP headers
- [ ] Review AWS S3 bucket permissions
- [ ] Enable database connection pooling

## Monitoring and Maintenance

### Health Checks
- Database connectivity
- S3 upload functionality
- Redis connection (if used)
- Application response times

### Backup Strategy
- Regular database backups
- S3 bucket versioning
- Code repository backups

### Performance Monitoring
- Application performance monitoring (APM)
- Database query performance
- CDN cache hit rates
- Image optimization metrics

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma studio

# Check connection string format
echo $DATABASE_URL
```

#### S3 Upload Issues
- Verify AWS credentials
- Check bucket permissions
- Confirm CORS configuration
- Test with AWS CLI

#### Performance Issues
- Enable Redis caching
- Optimize database queries
- Configure CDN
- Compress images

## Scaling Considerations

### Horizontal Scaling
- Load balancers
- Multiple application instances
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Database connection pooling
- Redis memory optimization
- Image optimization

---

For additional support, refer to the main README.md or create an issue on GitHub. 