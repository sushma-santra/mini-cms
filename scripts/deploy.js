#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuration
const config = {
  buildCommand: 'next build',
  zipFileName: 'si-cms-deploy.zip',
  s3Bucket: process.env.DEPLOY_S3_BUCKET || process.env.AWS_S3_BUCKET,
  s3KeyPrefix: process.env.DEPLOY_S3_KEY_PREFIX || 'new-cms-beta',
  s3Profile: process.env.AWS_PROFILE || 'default',
  includeFiles: [
    'next.config.js',
    'package.json',
    'postcss.config.js',
    'prisma/',
    'public/',
    'src/',
    'tailwind.config.js',
    'tsconfig.json',
    '.env.local',
    '.env.example'
  ]
};

// Logging utility
const log = {
  info: (message) => console.log(`ℹ️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`),
  warning: (message) => console.log(`⚠️  ${message}`),
  step: (message) => console.log(`\n🚀 ${message}`)
};

// Error handling utility
const handleError = (error, step) => {
  log.error(`${step} failed: ${error.message}`);
  process.exit(1);
};

// Step 1: Build the Next.js application
const buildApp = () => {
  log.step('Building Next.js application...');
  
  try {
    log.info(`Running: ${config.buildCommand}`);
    execSync(config.buildCommand, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log.success('Build completed successfully');
  } catch (error) {
    handleError(error, 'Build');
  }
};

// Step 2: Create zip file
const createZip = () => {
  log.step('Creating deployment package...');
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(config.zipFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      log.success(`Zip file created: ${config.zipFileName} (${sizeInMB} MB)`);
      resolve();
    });

    archive.on('error', (error) => {
      reject(error);
    });

    archive.pipe(output);

    // Add files to zip
    config.includeFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          log.info(`Adding directory: ${file}`);
          archive.directory(filePath, file);
        } else {
          log.info(`Adding file: ${file}`);
          archive.file(filePath, { name: file });
        }
      } else {
        log.warning(`File/directory not found: ${file}`);
      }
    });

    archive.finalize();
  });
};

// Step 3: Upload to S3
const uploadToS3 = async () => {
  log.step('Uploading to S3...');
  
  if (!config.s3Bucket) {
    handleError(new Error('S3 bucket not configured. Set DEPLOY_S3_BUCKET or AWS_S3_BUCKET environment variable.'), 'Configuration');
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const s3Key = `${config.s3KeyPrefix}/${config.zipFileName}`;
    
    log.info(`Uploading to: s3://${config.s3Bucket}/${s3Key}`);
    
    const fileContent = fs.readFileSync(config.zipFileName);
    
    const uploadCommand = new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'application/zip',
      Metadata: {
        'deploy-timestamp': timestamp,
        'deploy-version': timestamp,
        'build-command': config.buildCommand
      }
    });

    await s3Client.send(uploadCommand);
    
    log.success(`Upload completed successfully`);
    log.info(`S3 Location: s3://${config.s3Bucket}/${s3Key}`);
    
  } catch (error) {
    handleError(error, 'S3 Upload');
  }
};

// Step 4: Cleanup
const cleanup = () => {
  log.step('Cleaning up...');
  
  try {
    if (fs.existsSync(config.zipFileName)) {
      fs.unlinkSync(config.zipFileName);
      log.success(`Removed temporary file: ${config.zipFileName}`);
    }
  } catch (error) {
    log.warning(`Cleanup warning: ${error.message}`);
  }
};

// Main deployment function
const deploy = async () => {
  const startTime = Date.now();
  
  log.info('Starting deployment process...');
  log.info(`S3 Bucket: ${config.s3Bucket || 'Not configured'}`);
  log.info(`S3 Profile: ${config.s3Profile}`);
  log.info(`Working Directory: ${process.cwd()}`);
  
  try {
    buildApp();
    await createZip();
    await uploadToS3();
    cleanup();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log.success(`Deployment completed successfully in ${duration}s`);
    
  } catch (error) {
    handleError(error, 'Deployment');
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Simple CMS Deployment Script

Usage: node scripts/deploy.js [options]

Options:
  --help, -h          Show this help message
  --bucket <name>     Override S3 bucket name
  --prefix <prefix>   Override S3 key prefix (default: new-cms-beta)
  --profile <name>    Override AWS profile (default: default)

Environment Variables:
  DEPLOY_S3_BUCKET    S3 bucket for deployment (or AWS_S3_BUCKET)
  DEPLOY_S3_KEY_PREFIX S3 key prefix (default: new-cms-beta)
  AWS_PROFILE         AWS profile to use
  AWS_REGION          AWS region (default: us-east-1)

Example:
  DEPLOY_S3_BUCKET=my-deployment-bucket node scripts/deploy.js
  node scripts/deploy.js --bucket my-bucket --prefix releases
`);
  process.exit(0);
}

// Parse command line arguments
args.forEach((arg, index) => {
  if (arg === '--bucket' && args[index + 1]) {
    config.s3Bucket = args[index + 1];
  }
  if (arg === '--prefix' && args[index + 1]) {
    config.s3KeyPrefix = args[index + 1];
  }
  if (arg === '--profile' && args[index + 1]) {
    config.s3Profile = args[index + 1];
    process.env.AWS_PROFILE = args[index + 1];
  }
});

// Run deployment
deploy();
