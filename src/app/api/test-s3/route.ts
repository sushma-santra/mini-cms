import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'NOT_SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
      NEXT_PUBLIC_AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'NOT_SET',
      AWS_PROFILE: process.env.AWS_PROFILE || 'NOT_SET',
    }

    // Test S3 connection
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    })

    try {
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)
      
      return NextResponse.json({
        success: true,
        environment: envCheck,
        s3Connection: 'SUCCESS',
        buckets: response.Buckets?.map(b => b.Name) || [],
        message: 'S3 connection successful'
      })
    } catch (s3Error) {
      return NextResponse.json({
        success: false,
        environment: envCheck,
        s3Connection: 'FAILED',
        error: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        message: 'S3 connection failed - check credentials and permissions'
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test endpoint failed'
    }, { status: 500 })
  }
} 