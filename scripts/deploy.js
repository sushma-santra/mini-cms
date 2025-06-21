#!/usr/bin/env node

// Load environment variables from .env files
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromInstanceMetadata, fromIni } = require('@aws-sdk/credential-providers');

// Enhanced logging utility
const log = {
  info: (message) => console.log(`ℹ️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.log(`❌ ${message}`),
  warning: (message) => console.log(`⚠️  ${message}`),
  step: (message) => console.log(`\n🚀 ${message}`),
  debug: (message, data) => console.log(`🔍 ${message}`, data || '')
};

// Load environment variables with fallbacks
const loadEnvConfig = () => {
  log.step('Loading environment configuration...');
  
  // Check for .env files
  const envFiles = ['.env', '.env.local'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.info(`Found ${file} file`);
    } else {
      log.warning(`${file} file not found`);
    }
  });

  // Set default values if not provided
  process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
  process.env.AWS_PROFILE = process.env.AWS_PROFILE || 'default';
  process.env.isAWS = process.env.isAWS || 'false';
  
  // Log loaded configuration
  log.debug('Loaded environment configuration:', {
    AWS_REGION: process.env.AWS_REGION,
    AWS_PROFILE: process.env.AWS_PROFILE,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '(not set)',
    DEPLOY_S3_BUCKET: process.env.DEPLOY_S3_BUCKET || '(not set)',
    isAWS: process.env.isAWS
  });
};

// Configuration validation
const validateConfig = () => {
  log.step('Validating configuration...');
  
  const requiredEnvVars = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    DEPLOY_S3_BUCKET: process.env.DEPLOY_S3_BUCKET,
    AWS_PROFILE: process.env.AWS_PROFILE,
    isAWS: process.env.isAWS
  };

  log.debug('Environment variables:', requiredEnvVars);

  // Check for S3 bucket configuration
  if (!process.env.DEPLOY_S3_BUCKET && !process.env.AWS_S3_BUCKET) {
    throw new Error('S3 bucket not configured. Set DEPLOY_S3_BUCKET or AWS_S3_BUCKET environment variable.');
  }

  // Check AWS region
  if (!process.env.AWS_REGION) {
    log.warning('AWS_REGION not set, defaulting to us-east-1');
  }

  // Check AWS profile for local development
  if (process.env.isAWS !== 'true' && !process.env.AWS_PROFILE) {
    log.warning('AWS_PROFILE not set, defaulting to "default"');
  }

  log.success('Configuration validation completed');
};

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

// Error handling utility
const handleError = (error, step) => {
  log.error(`${step} failed: ${error.message}`);
  log.debug('Error details:', error);
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
    let s3Client;
    if (process.env.isAWS === 'true') {
      log.info("Using AWS IAM roles for credentials (EC2/ECS)")
      s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: fromInstanceMetadata(),
      });
    } else {
      log.info("Setting up AWS credentials for local development")
      log.debug("AWS Profile:", process.env.AWS_PROFILE || 'default')
      log.debug("AWS Region:", process.env.AWS_REGION || 'us-east-1')
      
      try {
        s3Client = new S3Client({
          region: process.env.AWS_REGION || "us-east-1",
          credentials: fromIni({
            profile: process.env.AWS_PROFILE || "default"
          }),
        });
        log.success("AWS credentials loaded successfully");
      } catch (error) {
        throw new Error(
          "AWS credentials not found. Please configure AWS CLI with 'aws configure' command\n" +
          "Error: " + error
        );
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const s3Key = `${config.s3KeyPrefix}/${config.zipFileName}`;
    
    log.info(`Target S3 location: s3://${config.s3Bucket}/${s3Key}`);
    log.debug('Upload configuration:', {
      bucket: config.s3Bucket,
      key: s3Key,
      timestamp,
      contentType: 'application/zip'
    });
    
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
  
  log.step('Starting deployment process...');
  
  try {
    // Load and validate configuration first
    loadEnvConfig();
    validateConfig();
    
    log.info('Deployment configuration:');
    log.debug('S3 Bucket:', config.s3Bucket);
    log.debug('S3 Profile:', config.s3Profile);
    log.debug('Working Directory:', process.cwd());
    
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
