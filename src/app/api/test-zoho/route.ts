import { NextResponse } from 'next/server'
import { zohoAPI } from '@/lib/zoho-api'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    // Sample test data for each form type
    const testData = {
      ebook: {
        module_name: 'ebook',
        first_name: 'Test',
        last_name: 'User',
        organisation_name: 'Test Company',
        country: 'United States',
        email: 'test@example.com',
        privacy_policy: true
      },
      newsletter: {
        module_name: 'newsletter',
        email: 'test@example.com'
      },
      contacts: {
        module_name: 'contacts',
        first_name: 'Test',
        last_name: 'Contact',
        organisation: 'Test Org',
        type_of_organisation: 'Technology',
        country: 'United States',
        phone_number: '+1234567890',
        email: 'test@example.com',
        message: 'This is a test message',
        privacy_policy: true
      }
    }

    // Get form type from request
    const body = await request.json()
    const formType = body.formType || 'ebook'

    if (!testData[formType as keyof typeof testData]) {
      return NextResponse.json({
        success: false,
        message: `Invalid form type. Must be one of: ${Object.keys(testData).join(', ')}`,
        data: [],
        pagination: {},
        filters: {}
      }, { status: 400 })
    }

    const data = testData[formType as keyof typeof testData]

    // Test Zoho integration
    await zohoAPI.pushToZoho(data, data.module_name)

    return NextResponse.json({
      success: true,
      message: 'Test completed successfully. Check server logs for details.',
      data: [],
      pagination: {},
      filters: {}
    })

  } catch (error: any) {
    logger.error('Zoho test failed:', {
      error: error.message || error
    })

    return NextResponse.json({
      success: false,
      message: `Test failed: ${error.message || 'Unknown error'}`,
      data: [],
      pagination: {},
      filters: {}
    }, { status: 500 })
  }
} 