import { NextRequest, NextResponse } from 'next/server';
import { mandrillService } from '@/lib/mandrill';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Test Mandrill configuration
    const configTest = await mandrillService.testConfiguration();
    
    const recommendations: string[] = [];

    // Add recommendations based on configuration
    if (!process.env.MANDRILL_API_KEY) {
      recommendations.push('Set MANDRILL_API_KEY environment variable with your Mailchimp API key');
    }

    if (!process.env.FROM_EMAIL) {
      recommendations.push('Set FROM_EMAIL environment variable with a verified email address');
    } else if (process.env.FROM_EMAIL.includes('example.com')) {
      recommendations.push('Replace FROM_EMAIL with a real, verified domain (not example.com)');
    }

    if (configTest.success) {
      recommendations.push('✅ Configuration looks good! Try sending a test email.');
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        MANDRILL_API_KEY: process.env.MANDRILL_API_KEY ? '✅ Set' : '❌ Not set',
        FROM_EMAIL: process.env.FROM_EMAIL || '❌ Not set',
        FROM_NAME: process.env.FROM_NAME || 'Your Company (default)',
      },
      configuration: configTest,
      recommendations
    };

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    logger.error('Mandrill test endpoint error:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      error: 'Failed to test Mandrill configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({
        error: 'Email is required for test'
      }, { status: 400 });
    }

    // Send a test email
    const success = await mandrillService.sendConfirmationEmail({
      email,
      firstName: firstName || 'Test',
      lastName: lastName || 'User',
      moduleType: 'ebook' // Use ebook template for test
    });

    return NextResponse.json({
      success,
      message: success 
        ? 'Test email sent successfully!' 
        : 'Failed to send test email. Check logs for details.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Mandrill test email error:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 