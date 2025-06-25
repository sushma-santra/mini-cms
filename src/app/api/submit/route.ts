import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { submissionSchema, cvFileSchema } from '@/lib/form-validation';
import { z } from 'zod';
import { zohoAPI } from '@/lib/zoho-api';
import { logger } from '@/lib/logger';
import { handleCorsPreflightRequest, createCorsResponse } from '@/lib/cors';
import { uploadFile, getS3CvKey, getRelativePath } from '@/lib/s3';
import { mandrillService } from '@/lib/mandrill';

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  return handleCorsPreflightRequest(request as any);
}

export async function POST(request: Request) {
  try {
    let body: any;
    let cvFile: File | null = null;
    
    // Check if request contains FormData (for careers with file upload)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for careers module with file upload
      const formData = await request.formData();
      
      // Extract form fields
      body = {
        module_name: formData.get('module_name') as string,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        job_title: formData.get('job_title') as string,
        captcha: formData.get('captcha') as string,
      };
      
      // Extract CV file if present
      cvFile = formData.get('cv_file') as File;
      
      // Remove empty string values (convert to undefined for optional fields)
      Object.keys(body).forEach(key => {
        if (body[key] === '' || body[key] === 'undefined') {
          body[key] = undefined;
        }
      });
    } else {
      // Handle JSON for existing modules (ebook, newsletter, contacts)
      body = await request.json();
    }

    // Validate submission data
    const validatedData = submissionSchema.parse(body);

    // Additional validation for careers module with CV file
    if (validatedData.module_name === 'careers' && cvFile) {
      // Validate file if present
      const fileValidation = cvFileSchema.safeParse({
        name: cvFile.name,
        size: cvFile.size,
        type: cvFile.type,
      });
      
      if (!fileValidation.success) {
        return NextResponse.json({
          success: false,
          message: "File validation failed",
          data: fileValidation.error.errors,
          pagination: {},
          filters: {}
        }, { status: 400 });
      }
    }

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(validatedData.captcha);
    if (!isValidCaptcha) {
      return createCorsResponse(
        { error: 'Invalid captcha verification' },
        { status: 400 },
        request as any
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

        // Send confirmation email in background (non-blocking)
        mandrillService.sendConfirmationEmail({
          email: ebookData.email,
          firstName: ebookData.first_name,
          lastName: ebookData.last_name,
          moduleType: 'ebook'
        }).catch(error => {
          logger.error('Failed to send confirmation email for ebook:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: ebookData.email
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

        // Send confirmation email in background (non-blocking)
        mandrillService.sendConfirmationEmail({
          email: newsletterData.email,
          moduleType: 'newsletter'
        }).catch(error => {
          logger.error('Failed to send confirmation email for newsletter:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: newsletterData.email
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

        // Send confirmation email in background (non-blocking)
        mandrillService.sendConfirmationEmail({
          email: contactData.email,
          firstName: contactData.first_name,
          lastName: contactData.last_name,
          moduleType: 'contacts'
        }).catch(error => {
          logger.error('Failed to send confirmation email for contact:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            email: contactData.email
          });
        });
        break;
      }

      case 'careers': {
        const { module_name, captcha, ...careersData } = validatedData;
        let cvFileUrl: string | undefined;
        
        // Handle CV file upload if present
        if (cvFile) {
          try {
            // Generate unique filename for CV
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = cvFile.name.split('.').pop();
            const fileName = `${timestamp}-${randomString}.${extension}`;
            
            // Upload to S3 and get relative path
            const s3Key = getS3CvKey(fileName);
            await uploadFile(cvFile, s3Key);
            cvFileUrl = getRelativePath(s3Key);
          } catch (uploadError) {
            logger.error('Failed to upload CV file:', {
              error: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
              fileName: cvFile.name
            });
            
            return NextResponse.json({
              success: false,
              message: "Failed to upload CV file",
              data: [],
              pagination: {},
              filters: {}
            }, { status: 500 });
          }
        }
        
        // Save career submission to database
        await prisma.careerSubmission.create({
          data: {
            firstName: careersData.first_name,
            lastName: careersData.last_name,
            email: careersData.email,
            jobTitle: careersData.job_title,
            cvFileUrl: cvFileUrl,
          },
        });

        // Note: Zoho integration is disabled as per requirements
        // Can be enabled later if needed
        break;
      }
    }

    return createCorsResponse({
      success: true,
      message: "Submission successful",
      data: [],
      pagination: {},
      filters: {}
    }, {}, request as any);

  } catch (error) {
    logger.error('Form submission failed:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof z.ZodError) {
      return createCorsResponse({
        success: false,
        message: "Validation failed",
        data: error.errors,
        pagination: {},
        filters: {}
      }, { status: 400 }, request as any);
    }

    return createCorsResponse({
      success: false,
      message: "Internal server error",
      data: [],
      pagination: {},
      filters: {}
    }, { status: 500 }, request as any);
  }
} 