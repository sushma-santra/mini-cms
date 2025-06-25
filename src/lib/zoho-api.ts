import axios from 'axios'
import { logger } from './logger'

const ZOHO_PUSH_ENABLED = process.env.ZOHO_PUSH_ENABLED !== 'false';

interface ZohoTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  api_domain: string
  token_type: string
}

interface ZohoConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  apiDomain: string
}

class ZohoAPI {
  private config: ZohoConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    // Load configuration from environment variables
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
      refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
      apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in'
    }

    // Log config (without sensitive data)
    logger.debug('Zoho API Configuration:', {
      hasClientId: !!this.config.clientId,
      hasClientSecret: !!this.config.clientSecret,
      hasRefreshToken: !!this.config.refreshToken,
      apiDomain: this.config.apiDomain
    })

    if (!this.config.clientId || !this.config.clientSecret || !this.config.refreshToken) {
      throw new Error('Missing required Zoho CRM configuration')
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      logger.debug('Attempting to refresh Zoho access token')

      const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'
      const params = {
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token'
      }

      logger.debug('Token refresh request:', {
        url: tokenUrl,
        hasRefreshToken: !!params.refresh_token,
        hasClientId: !!params.client_id,
        hasClientSecret: !!params.client_secret
      })

      const response = await axios.post(tokenUrl, null, { params })

      const data = response.data as ZohoTokens
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000 // Subtract 5 minutes for safety

      logger.info('Zoho access token refreshed successfully', {
        expiresIn: data.expires_in,
        tokenExpiry: new Date(this.tokenExpiry).toISOString()
      })
    } catch (error: any) {
      logger.error('Failed to refresh Zoho access token:', { 
        error: error.response?.data || error.message || 'Unknown error',
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      throw new Error('Failed to refresh Zoho access token')
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken()
    }
    return this.accessToken!
  }

  private mapFormDataToZohoLead(formData: any, moduleName: string): any {
    // Base mapping for common fields
    const baseMapping = {
      First_Name: formData.first_name,
      Last_Name: formData.last_name,
      Email: formData.email,
    }

    // Module-specific mappings
    switch (moduleName) {
      case 'ebook':
        return {
          ...baseMapping,
          Company: formData.organisation_name,
          Country: formData.country,
          Lead_Source: 'Ebook Download',
          Description: 'Lead from ebook download form'
        }

      case 'newsletter':
        return {
          Last_Name: formData.email.split('@')[0], // Required field in Zoho
          Email: formData.email,
          Lead_Source: 'Newsletter Subscription',
          Description: 'Lead from newsletter subscription'
        }

      case 'contacts':
        return {
          ...baseMapping,
          Company: formData.organisation,
          Phone: formData.phone_number,
          Country: formData.country,
          Industry: formData.type_of_organisation,
          Lead_Source: 'Contact Form',
          Description: formData.message
        }

      default:
        throw new Error(`Unsupported module: ${moduleName}`)
    }
  }

  public async pushToZoho(formData: any, moduleName: string): Promise<void> {
    if (!ZOHO_PUSH_ENABLED) {
      logger.info('Zoho CRM push is disabled by config. Skipping push.', { moduleName });
      return;
    }
    try {
      const accessToken = await this.ensureValidToken()
      const zohoData = this.mapFormDataToZohoLead(formData, moduleName)

      logger.debug('Pushing data to Zoho CRM:', {
        url: `${this.config.apiDomain}/crm/v3/Leads`,
        data: zohoData
      })

      const response = await axios.post(
        `${this.config.apiDomain}/crm/v3/Leads`,
        { data: [zohoData] },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      logger.info('Successfully pushed data to Zoho CRM:', {
        moduleName,
        zohoResponse: response.data
      })
    } catch (error: any) {
      // Log error but don't throw - we don't want to affect the main API flow
      logger.error('Failed to push data to Zoho CRM:', {
        moduleName,
        error: error.response?.data || error.message || 'Unknown error',
        status: error.response?.status,
        statusText: error.response?.statusText,
        formData
      })
    }
  }
}

// Export a singleton instance
export const zohoAPI = new ZohoAPI() 