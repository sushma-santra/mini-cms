#!/usr/bin/env node

/**
 * Prisma Undefined Error Fix Script
 * 
 * This script attempts to fix the common causes of:
 * "Cannot read properties of undefined (reading 'findMany')"
 * 
 * Usage:
 *   node scripts/fix-prisma-undefined.js
 *   node scripts/fix-prisma-undefined.js --force
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Prisma Undefined Error Fix Script\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return false;
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`📁 ${description}: ${exists ? '✅ Found' : '❌ Missing'} (${filePath})`);
  return exists;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  console.log('🔍 Step 1: Checking current state...\n');
  
  // Check essential files
  const schemaExists = checkFile('prisma/schema.prisma', 'Prisma Schema');
  const packageExists = checkFile('package.json', 'Package.json');
  const envExists = checkFile('.env.local', 'Environment file');
  
  console.log('');
  
  if (!schemaExists) {
    console.log('❌ Critical: Prisma schema not found. Please ensure your project is set up correctly.');
    process.exit(1);
  }
  
  console.log('🔧 Step 2: Fixing Prisma Client...\n');
  
  // Step 1: Clean existing client
  if (force) {
    console.log('🧹 Force mode: Cleaning existing Prisma client...');
    try {
      execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
      execSync('rm -rf node_modules/@prisma/client', { stdio: 'inherit' });
      console.log('✅ Cleaned existing Prisma client\n');
    } catch (error) {
      console.log('⚠️ Could not clean existing client (this is usually fine)\n');
    }
  }
  
  // Step 2: Install dependencies
  console.log('📦 Installing/updating dependencies...');
  const installSuccess = runCommand('npm install', 'Installing dependencies');
  
  if (!installSuccess) {
    console.log('❌ Failed to install dependencies. Please check your package.json and try again.');
    process.exit(1);
  }
  
  // Step 3: Generate Prisma client
  const generateSuccess = runCommand('npx prisma generate', 'Generating Prisma client');
  
  if (!generateSuccess) {
    console.log('❌ Failed to generate Prisma client. Please check your schema.prisma file.');
    process.exit(1);
  }
  
  // Step 4: Check database connection
  console.log('🔍 Step 3: Checking database connection...\n');
  
  if (!envExists) {
    console.log('⚠️ Warning: .env.local not found. Creating template...');
    
    const envTemplate = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/simple_cms"

# Add your other environment variables here
`;
    
    fs.writeFileSync('.env.local', envTemplate);
    console.log('✅ Created .env.local template. Please update with your database URL.\n');
  }
  
  // Step 5: Validate schema and database
  console.log('🔍 Step 4: Validating schema and database...\n');
  
  const validateSuccess = runCommand('npx prisma validate', 'Validating Prisma schema');
  
  if (!validateSuccess) {
    console.log('❌ Schema validation failed. Please check your prisma/schema.prisma file.');
    process.exit(1);
  }
  
  // Step 6: Check database status
  console.log('🗄️ Checking database status...');
  const dbStatusSuccess = runCommand('npx prisma db pull --print', 'Checking database schema');
  
  if (!dbStatusSuccess) {
    console.log('⚠️ Could not connect to database. You may need to:');
    console.log('   1. Update your DATABASE_URL in .env.local');
    console.log('   2. Run: npx prisma db push (to create tables)');
    console.log('   3. Or run: npx prisma migrate deploy (if you have migrations)\n');
  }
  
  // Step 7: Build the application
  console.log('🔍 Step 5: Building the application...\n');
  
  const buildSuccess = runCommand('npm run build', 'Building Next.js application');
  
  if (!buildSuccess) {
    console.log('❌ Build failed. Please check the error messages above.');
    process.exit(1);
  }
  
  // Step 8: Final verification
  console.log('🔍 Step 6: Final verification...\n');
  
  // Check if Prisma client was generated
  const clientPath = path.join('node_modules', '.prisma', 'client');
  const clientExists = checkFile(clientPath, 'Generated Prisma Client');
  
  // Check if build artifacts exist
  const buildPath = path.join('.next', 'server');
  const buildExists = checkFile(buildPath, 'Next.js Build Artifacts');
  
  console.log('');
  
  if (clientExists && buildExists) {
    console.log('✅ All checks passed! The Prisma undefined error should be resolved.\n');
    
    console.log('🚀 Next steps:');
    console.log('   1. Deploy your updated application');
    console.log('   2. Ensure environment variables are set on the server');
    console.log('   3. Make sure the database is accessible from the server');
    console.log('   4. Check server logs for any remaining issues\n');
    
    console.log('📋 If the error persists, run:');
    console.log('   node scripts/diagnose-prisma.js');
    console.log('   This will provide detailed diagnostic information.\n');
    
  } else {
    console.log('❌ Some checks failed. Please review the errors above and try again.\n');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}); 