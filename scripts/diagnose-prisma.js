#!/usr/bin/env node

/**
 * Prisma Diagnostic Script
 * 
 * This script helps diagnose Prisma connection and configuration issues
 * that might cause the "Cannot read properties of undefined (reading 'findMany')" error.
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

console.log('🔍 Prisma Diagnostic Tool\n');

// Check environment variables
function checkEnvironment() {
  console.log('📋 Environment Variables:');
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`  PWD: ${process.cwd()}`);
  console.log('');
}

// Check Prisma files
function checkPrismaFiles() {
  console.log('📁 Prisma Files:');
  
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  const libPrismaPath = path.join(process.cwd(), 'src', 'lib', 'prisma.ts');
  
  console.log(`  Schema: ${fs.existsSync(schemaPath) ? '✅ Found' : '❌ Missing'} (${schemaPath})`);
  console.log(`  Generated Client: ${fs.existsSync(clientPath) ? '✅ Found' : '❌ Missing'} (${clientPath})`);
  console.log(`  Lib Prisma: ${fs.existsSync(libPrismaPath) ? '✅ Found' : '❌ Missing'} (${libPrismaPath})`);
  console.log('');
}

// Test Prisma client initialization
async function testPrismaClient() {
  console.log('🔧 Testing Prisma Client:');
  
  try {
    // Test direct initialization
    const prisma = new PrismaClient();
    console.log('  ✅ PrismaClient instantiated successfully');
    
    // Test connection
    await prisma.$connect();
    console.log('  ✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`  ✅ Query successful - User count: ${userCount}`);
    
    // Test Event model specifically
    try {
      const eventCount = await prisma.event.count();
      console.log(`  ✅ Event model accessible - Event count: ${eventCount}`);
    } catch (eventError) {
      console.log(`  ❌ Event model error: ${eventError.message}`);
    }
    
    await prisma.$disconnect();
    console.log('  ✅ Database disconnected successfully');
    
  } catch (error) {
    console.log(`  ❌ Prisma Client Error: ${error.message}`);
    console.log(`  Error Code: ${error.code || 'Unknown'}`);
    console.log(`  Error Stack: ${error.stack}`);
  }
  console.log('');
}

// Test the lib/prisma.ts import
async function testLibPrismaImport() {
  console.log('📦 Testing lib/prisma.ts import:');
  
  try {
    const libPrismaPath = path.join(process.cwd(), 'src', 'lib', 'prisma.ts');
    
    if (!fs.existsSync(libPrismaPath)) {
      console.log('  ❌ lib/prisma.ts file not found');
      return;
    }
    
    // Try to require the compiled version if it exists
    const compiledPath = path.join(process.cwd(), '.next', 'server', 'chunks');
    console.log(`  Compiled chunks path: ${fs.existsSync(compiledPath) ? '✅ Exists' : '❌ Missing'}`);
    
    // Check if TypeScript compilation is needed
    console.log('  💡 Note: In production, ensure TypeScript files are compiled');
    console.log('  💡 Run: npm run build to compile TypeScript files');
    
  } catch (error) {
    console.log(`  ❌ Import Error: ${error.message}`);
  }
  console.log('');
}

// Check database schema
async function checkDatabaseSchema() {
  console.log('🗄️  Database Schema Check:');
  
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Check if Event table exists
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'events';
    `;
    
    if (result.length > 0) {
      console.log('  ✅ Events table exists in database');
      
      // Check table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'events'
        ORDER BY ordinal_position;
      `;
      
      console.log(`  ✅ Events table has ${columns.length} columns`);
      console.log('  📋 Columns:', columns.map(col => `${col.column_name} (${col.data_type})`).join(', '));
      
    } else {
      console.log('  ❌ Events table not found in database');
      console.log('  💡 Run: npx prisma db push or npx prisma migrate deploy');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log(`  ❌ Database Schema Error: ${error.message}`);
  }
  console.log('');
}

// Generate recommendations
function generateRecommendations() {
  console.log('💡 Troubleshooting Recommendations:\n');
  
  console.log('1. **Environment Variables**:');
  console.log('   - Ensure DATABASE_URL is set correctly');
  console.log('   - Check .env.local file exists and is loaded');
  console.log('');
  
  console.log('2. **Prisma Client Generation**:');
  console.log('   - Run: npx prisma generate');
  console.log('   - Run: npm run build');
  console.log('');
  
  console.log('3. **Database Migration**:');
  console.log('   - Run: npx prisma db push');
  console.log('   - Or: npx prisma migrate deploy');
  console.log('');
  
  console.log('4. **Server Deployment**:');
  console.log('   - Ensure all dependencies are installed');
  console.log('   - Check if .next/server directory contains compiled files');
  console.log('   - Verify environment variables are available at runtime');
  console.log('');
  
  console.log('5. **Debug Commands**:');
  console.log('   - Check Prisma status: npx prisma studio');
  console.log('   - Validate schema: npx prisma validate');
  console.log('   - Reset database: npx prisma db push --force-reset');
}

// Main diagnostic function
async function runDiagnostics() {
  try {
    checkEnvironment();
    checkPrismaFiles();
    await testPrismaClient();
    await testLibPrismaImport();
    await checkDatabaseSchema();
    generateRecommendations();
    
    console.log('✅ Diagnostic complete!');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    process.exit(1);
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics();
}

module.exports = {
  checkEnvironment,
  checkPrismaFiles,
  testPrismaClient,
  checkDatabaseSchema
}; 