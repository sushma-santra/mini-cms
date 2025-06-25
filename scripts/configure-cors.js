#!/usr/bin/env node

/**
 * CORS Configuration Helper Script
 * 
 * This script helps you configure CORS origins for your Simple CMS application.
 * 
 * Usage:
 *   node scripts/configure-cors.js --origin https://abc.com
 *   node scripts/configure-cors.js --origin https://abc.com --additional https://staging.abc.com,https://dev.abc.com
 *   node scripts/configure-cors.js --check
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--origin' && i + 1 < args.length) {
      config.origin = args[i + 1];
      i++;
    } else if (arg === '--additional' && i + 1 < args.length) {
      config.additional = args[i + 1];
      i++;
    } else if (arg === '--check') {
      config.check = true;
    } else if (arg === '--help' || arg === '-h') {
      config.help = true;
    }
  }
  
  return config;
}

// Show help
function showHelp() {
  console.log(`
🌐 CORS Configuration Helper

Usage:
  node scripts/configure-cors.js [options]

Options:
  --origin <url>        Set the primary allowed origin
  --additional <urls>   Set additional allowed origins (comma-separated)
  --check              Check current CORS configuration
  --help, -h           Show this help message

Examples:
  # Set single origin
  node scripts/configure-cors.js --origin https://abc.com
  
  # Set primary + additional origins
  node scripts/configure-cors.js --origin https://abc.com --additional https://staging.abc.com,https://dev.abc.com
  
  # Check current configuration
  node scripts/configure-cors.js --check

Environment Variables:
  CORS_ALLOWED_ORIGIN      Primary allowed origin
  CORS_ADDITIONAL_ORIGINS  Additional origins (comma-separated)
  NEXT_PUBLIC_FRONTEND_URL Alternative to CORS_ALLOWED_ORIGIN
`);
}

// Check current configuration
function checkConfiguration() {
  console.log('🔍 Current CORS Configuration:\n');
  
  // Check environment variables
  const envFile = path.join(process.cwd(), '.env.local');
  const envExampleFile = path.join(process.cwd(), 'env.example');
  
  console.log('📁 Environment Files:');
  console.log(`  .env.local: ${fs.existsSync(envFile) ? '✅ Found' : '❌ Not found'}`);
  console.log(`  env.example: ${fs.existsSync(envExampleFile) ? '✅ Found' : '❌ Not found'}`);
  
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const corsOrigin = content.match(/CORS_ALLOWED_ORIGIN=(.+)/);
    const corsAdditional = content.match(/CORS_ADDITIONAL_ORIGINS=(.+)/);
    const frontendUrl = content.match(/NEXT_PUBLIC_FRONTEND_URL=(.+)/);
    
    console.log('\n🎯 Configured Origins:');
    console.log(`  Primary Origin: ${corsOrigin ? corsOrigin[1] : '❌ Not set'}`);
    console.log(`  Frontend URL: ${frontendUrl ? frontendUrl[1] : '❌ Not set'}`);
    console.log(`  Additional Origins: ${corsAdditional ? corsAdditional[1] : '❌ Not set'}`);
  }
  
  // Check runtime configuration
  console.log('\n⚙️  Runtime Configuration:');
  try {
    const corsConfig = require('../src/lib/cors.ts');
    console.log('  CORS utility: ✅ Available');
  } catch (error) {
    console.log('  CORS utility: ❌ Error loading');
  }
  
  // Check middleware
  const middlewareFile = path.join(process.cwd(), 'middleware.ts');
  console.log(`  Middleware: ${fs.existsSync(middlewareFile) ? '✅ Found' : '❌ Not found'}`);
  
  console.log('\n💡 Tips:');
  console.log('  - Use --origin to set your primary frontend domain');
  console.log('  - Use --additional for staging/development domains');
  console.log('  - Restart your application after changing environment variables');
}

// Update environment file
function updateEnvironment(origin, additional) {
  const envFile = path.join(process.cwd(), '.env.local');
  let content = '';
  
  // Read existing content
  if (fs.existsSync(envFile)) {
    content = fs.readFileSync(envFile, 'utf8');
  }
  
  // Update or add CORS_ALLOWED_ORIGIN
  if (origin) {
    if (content.includes('CORS_ALLOWED_ORIGIN=')) {
      content = content.replace(/CORS_ALLOWED_ORIGIN=.+/, `CORS_ALLOWED_ORIGIN="${origin}"`);
    } else {
      content += `\n# CORS Configuration\nCORS_ALLOWED_ORIGIN="${origin}"\n`;
    }
  }
  
  // Update or add CORS_ADDITIONAL_ORIGINS
  if (additional) {
    if (content.includes('CORS_ADDITIONAL_ORIGINS=')) {
      content = content.replace(/CORS_ADDITIONAL_ORIGINS=.+/, `CORS_ADDITIONAL_ORIGINS="${additional}"`);
    } else {
      if (!content.includes('# CORS Configuration')) {
        content += '\n# CORS Configuration\n';
      }
      content += `CORS_ADDITIONAL_ORIGINS="${additional}"\n`;
    }
  }
  
  // Write updated content
  fs.writeFileSync(envFile, content);
  
  console.log('✅ Updated .env.local with CORS configuration:');
  if (origin) {
    console.log(`   Primary Origin: ${origin}`);
  }
  if (additional) {
    console.log(`   Additional Origins: ${additional}`);
  }
  
  console.log('\n🔄 Please restart your application to apply changes.');
}

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Main function
function main() {
  const config = parseArgs();
  
  if (config.help) {
    showHelp();
    return;
  }
  
  if (config.check) {
    checkConfiguration();
    return;
  }
  
  // Validate origin
  if (config.origin && !isValidUrl(config.origin)) {
    console.error('❌ Error: Invalid origin URL. Must start with http:// or https://');
    process.exit(1);
  }
  
  // Validate additional origins
  if (config.additional) {
    const additionalOrigins = config.additional.split(',').map(o => o.trim());
    for (const origin of additionalOrigins) {
      if (!isValidUrl(origin)) {
        console.error(`❌ Error: Invalid additional origin URL: ${origin}`);
        process.exit(1);
      }
    }
  }
  
  if (config.origin || config.additional) {
    updateEnvironment(config.origin, config.additional);
  } else {
    console.log('ℹ️  No configuration provided. Use --help for usage information.');
    console.log('   Or use --check to see current configuration.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { parseArgs, checkConfiguration, updateEnvironment, isValidUrl }; 