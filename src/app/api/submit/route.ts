import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { submissionSchema } from '@/lib/form-validation';
import { z } from 'zod';
import { zohoAPI } from '@/lib/zoho-api';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate submission data
    const validatedData = submissionSchema.parse(body);

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(validatedData.captcha);
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'Invalid captcha verification' },
        { status: 400 }
      );
    }

    // Process submission based on module type
    switch (validatedData.module_name) {
      case 'ebook': {
        const { module_name, captcha, ...ebookData } = validatedData;
        await prisma.ebookSubmission.create({
          data: {
            firstName: ebookData.first_name,
            lastName: ebookData.last_name,
            organisationName: ebookData.organisation_name,
            country: ebookData.country,
            email: ebookData.email,
            privacyPolicy: ebookData.privacy_policy,
          },
        });

        // Push to Zoho CRM in background
        zohoAPI.pushToZoho(ebookData, module_name)
          .catch(error => {
            logger.error('Failed to push ebook data to Zoho:', {
              error: error.message,
              data: ebookData
            });
          });
        break;
      }

      case 'newsletter': {
        const { module_name, captcha, ...newsletterData } = validatedData;
        await prisma.newsletterSubscription.create({
          data: {
            email: newsletterData.email,
          },
        });

        // Push to Zoho CRM in background
        zohoAPI.pushToZoho(newsletterData, module_name)
          .catch(error => {
            logger.error('Failed to push newsletter data to Zoho:', {
              error: error.message,
              data: newsletterData
            });
          });
        break;
      }

      case 'contacts': {
        const { module_name, captcha, ...contactData } = validatedData;
        await prisma.contactSubmission.create({
          data: {
            firstName: contactData.first_name,
            lastName: contactData.last_name,
            organisation: contactData.organisation,
            typeOfOrganisation: contactData.type_of_organisation,
            country: contactData.country,
            phoneNumber: contactData.phone_number,
            email: contactData.email,
            message: contactData.message,
            privacyPolicy: contactData.privacy_policy,
          },
        });

        // Push to Zoho CRM in background
        zohoAPI.pushToZoho(contactData, module_name)
          .catch(error => {
            logger.error('Failed to push contact data to Zoho:', {
              error: error.message,
              data: contactData
            });
          });
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Submission successful",
      data: [],
      pagination: {},
      filters: {}
    });

  } catch (error) {
    logger.error('Form submission failed:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        data: error.errors,
        pagination: {},
        filters: {}
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "Internal server error",
      data: [],
      pagination: {},
      filters: {}
    }, { status: 500 });
  }
} 