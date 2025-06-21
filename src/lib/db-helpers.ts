import { prisma } from '@/lib/prisma'
import { logger } from './logger'

export async function storeFormSubmission(formData: any, moduleName: string) {
  try {
    let result

    switch (moduleName) {
      case 'ebook':
        result = await prisma.ebookSubmission.create({
          data: {
            firstName: formData.first_name,
            lastName: formData.last_name,
            organisationName: formData.organisation_name,
            country: formData.country,
            email: formData.email,
            privacyPolicy: formData.privacy_policy
          }
        })
        break

      case 'newsletter':
        result = await prisma.newsletterSubscription.create({
          data: {
            email: formData.email
          }
        })
        break

      case 'contacts':
        result = await prisma.contactSubmission.create({
          data: {
            firstName: formData.first_name,
            lastName: formData.last_name,
            organisation: formData.organisation,
            typeOfOrganisation: formData.type_of_organisation,
            country: formData.country,
            phoneNumber: formData.phone_number,
            email: formData.email,
            message: formData.message,
            privacyPolicy: formData.privacy_policy || false
          }
        })
        break

      default:
        throw new Error(`Unsupported module: ${moduleName}`)
    }

    logger.info('Successfully stored form submission:', {
      moduleName,
      id: result.id
    })

    return result
  } catch (error: any) {
    logger.error('Failed to store form submission:', {
      error: error.message,
      moduleName,
      formData
    })
    throw error
  }
} 