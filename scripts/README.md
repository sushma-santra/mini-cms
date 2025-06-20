# Deployment Scripts

This directory contains utility scripts for building, packaging, and deploying the Simple CMS application.

## deploy.js

A comprehensive deployment script that automates the build, packaging, and S3 upload process for the Simple CMS application.

### Features

✅ **Build Automation**
- Runs `next build` to create production build
- Handles build errors gracefully
- Provides detailed logging

✅ **Package Creation**
- Creates `si-cms-deploy.zip` with all necessary files
- Excludes unnecessary files (node_modules, .next, etc.)
- Uses maximum compression for smaller file sizes

✅ **S3 Upload**
- Uploads to configurable S3 bucket
- Uses AWS profile authentication
- Creates timestamped and 'latest' versions
- Includes metadata for tracking

✅ **Error Handling**
- Graceful error handling at each step
- Detailed error messages
- Automatic cleanup on failure

### Installation

1. Install the required dependency:
```bash
npm install archiver
```

2. Ensure AWS CLI is configured with appropriate profile:
```bash
aws configure
```

### Usage

#### Basic Usage
```bash
# Using npm script
npm run deploy

# Direct execution
node scripts/deploy.js
```

#### With Environment Variables
```bash
DEPLOY_S3_BUCKET=my-deployment-bucket npm run deploy
```

#### With Command Line Arguments
```bash
node scripts/deploy.js --bucket my-bucket --prefix releases --profile production
```

### Configuration

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEPLOY_S3_BUCKET` | S3 bucket for deployment | `AWS_S3_BUCKET` |
| `DEPLOY_S3_KEY_PREFIX` | S3 key prefix | `new-cms-beta` |
| `AWS_PROFILE` | AWS profile to use | `default` |
| `AWS_REGION` | AWS region | `us-east-1` |

#### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--help, -h` | Show help message | `--help` |
| `--bucket` | Override S3 bucket name | `--bucket my-bucket` |
| `--prefix` | Override S3 key prefix | `--prefix releases` |
| `--profile` | Override AWS profile | `--profile production` |

### Files Included in Package

The script creates a zip file containing:

```
si-cms-deploy.zip
├── next.config.js
├── package.json
├── postcss.config.js
├── prisma/
├── public/
├── src/
├── tailwind.config.js
├── tsconfig.json
├── .env.local (if exists)
└── .env.example
```

### S3 Structure

The script uploads to S3 with the following structure:

```
s3://your-bucket/
└── new-cms-beta/
    └── si-cms-deploy.zip  # Deployment package
```

The deployment package is uploaded with the exact filename `si-cms-deploy.zip` without any timestamp.

### Example Workflows

#### Development Deployment
```bash
# Set environment variables
export DEPLOY_S3_BUCKET=dev-simple-cms-deployments
export AWS_PROFILE=development

# Run deployment
npm run deploy
```

#### Production Deployment
```bash
# Set environment variables
export DEPLOY_S3_BUCKET=prod-simple-cms-deployments
export DEPLOY_S3_KEY_PREFIX=production
export AWS_PROFILE=production

# Run deployment
npm run deploy
```

#### CI/CD Integration
```bash
# In your CI/CD pipeline
DEPLOY_S3_BUCKET=$DEPLOYMENT_BUCKET \
AWS_PROFILE=$AWS_PROFILE \
npm run deploy
```

### Troubleshooting

#### Common Issues

1. **Build Failure**
   ```
   ❌ Build failed: Command failed: next build
   ```
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **S3 Upload Failure**
   ```
   ❌ S3 Upload failed: Access Denied
   ```
   - Verify AWS credentials/profile
   - Check S3 bucket permissions
   - Ensure bucket exists

3. **Configuration Error**
   ```
   ❌ Configuration failed: S3 bucket not configured
   ```
   - Set `DEPLOY_S3_BUCKET` environment variable
   - Or use `--bucket` command line argument

#### Debug Mode

To see detailed information about what would be deployed:

```bash
node scripts/deploy.js --help
```

### Security Considerations

- Uses AWS profile authentication (recommended over hardcoded keys)
- Excludes sensitive files from deployment package
- Includes only necessary files for deployment
- Uses secure S3 upload with proper metadata

### Dependencies

- `archiver`: For creating zip files with compression
- `@aws-sdk/client-s3`: For S3 upload functionality
- Node.js built-in modules: `child_process`, `fs`, `path`

### Contributing

When modifying the deployment script:

1. Maintain backward compatibility
2. Add appropriate error handling
3. Update this documentation
4. Test with different configurations
5. Follow the existing logging patterns 