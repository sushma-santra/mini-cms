import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      environment: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV,
        AWS_REGION: process.env.AWS_REGION || 'Not set',
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'Not set',
        AWS_PROFILE: process.env.AWS_PROFILE || 'Not set (will use default)',
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 