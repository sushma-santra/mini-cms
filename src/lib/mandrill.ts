/**
 * Mandrill Email Service
 * 
 * Required Environment Variables:
 * - MANDRILL_API_KEY: Your Mandrill API key from Mailchimp
 * - FROM_EMAIL: The email address to send from (MUST be from a verified domain in Mailchimp)
 * - FROM_NAME: The name to send from (optional, defaults to "Your Company")
 * 
 * IMPORTANT: The FROM_EMAIL domain must be verified in your Mailchimp account.
 * Common verified domains: Gmail, your company domain, etc.
 * Do NOT use placeholder domains like "example.com"
 * 
 * Usage:
 * This service is automatically integrated into the form submission API endpoints
 * and sends confirmation emails after successful database and Zoho CRM operations.
 */
import axios from 'axios';
import { logger } from './logger';

interface MandrillMessage {
  html?: string;
  text?: string;
  subject: string;
  from_email: string;
  from_name: string;
  to: Array<{
    email: string;
    name?: string;
    type?: string;
  }>;
  tags?: string[];
  template_name?: string;
  template_content?: Array<{
    name: string;
    content: string;
  }>;
}

interface MandrillEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
  moduleType: 'ebook' | 'newsletter' | 'contacts';
  additionalData?: Record<string, any>;
}

class MandrillService {
  private apiKey: string;
  private apiUrl = 'https://mandrillapp.com/api/1.0';
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.MANDRILL_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || '';
    this.fromName = process.env.FROM_NAME || 'Your Company';
    
    if (!this.apiKey) {
      logger.warn('MANDRILL_API_KEY environment variable is not set');
    }
    
    if (!this.fromEmail) {
      logger.error('FROM_EMAIL environment variable is not set. This is required for Mandrill to work.');
    } else if (this.fromEmail.includes('example.com')) {
      logger.error('FROM_EMAIL is set to a placeholder domain (example.com). Please use a verified domain from your Mailchimp account.');
    }
  }

  private getEmailContent(data: MandrillEmailData): { subject: string; html: string; text: string } {
    const { firstName, lastName, moduleType } = data;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'there';

    switch (moduleType) {
      case 'ebook':
        return {
          subject: 'Thank you for downloading our eBook!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Thank you for your interest!</h2>
              <p>Hi ${fullName},</p>
              <p>Thank you for downloading our eBook. We hope you find it valuable and informative.</p>
              <p>If you have any questions or need further assistance, please don't hesitate to reach out to us.</p>
              <p>Best regards,<br>The Team</p>
            </div>
          `,
          text: `Hi ${fullName},\n\nThank you for downloading our eBook. We hope you find it valuable and informative.\n\nIf you have any questions or need further assistance, please don't hesitate to reach out to us.\n\nBest regards,\nThe Team`
        };

      case 'newsletter':
        return {
          subject: 'Welcome to our newsletter!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Welcome to our newsletter!</h2>
              <p>Hi there,</p>
              <p>Thank you for subscribing to our newsletter. You'll now receive our latest updates, insights, and news directly in your inbox.</p>
              <p>We're excited to have you as part of our community!</p>
              <p>Best regards,<br>The Team</p>
            </div>
          `,
          text: `Hi there,\n\nThank you for subscribing to our newsletter. You'll now receive our latest updates, insights, and news directly in your inbox.\n\nWe're excited to have you as part of our community!\n\nBest regards,\nThe Team`
        };

      case 'contacts':
        return {
          subject: 'We received your message',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Thank you for contacting us!</h2>
              <p>Hi ${fullName},</p>
              <p>We've received your message and will get back to you as soon as possible.</p>
              <p>Our team typically responds within 24-48 hours during business days.</p>
              <p>Thank you for your patience.</p>
              <p>Best regards,<br>The Team</p>
            </div>
          `,
          text: `Hi ${fullName},\n\nWe've received your message and will get back to you as soon as possible.\n\nOur team typically responds within 24-48 hours during business days.\n\nThank you for your patience.\n\nBest regards,\nThe Team`
        };

      default:
        return {
          subject: 'Thank you for your submission',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Thank you!</h2>
              <p>Hi ${fullName},</p>
              <p>Thank you for your submission. We've received your information and will process it accordingly.</p>
              <p>Best regards,<br>The Team</p>
            </div>
          `,
          text: `Hi ${fullName},\n\nThank you for your submission. We've received your information and will process it accordingly.\n\nBest regards,\nThe Team`
        };
    }
  }

  private getHelpfulErrorMessage(rejectReason: string): string {
    const errorMessages: Record<string, string> = {
      'recipient-domain-mismatch': 'The sender domain is not verified in your Mailchimp account. Please verify your FROM_EMAIL domain in Mailchimp settings.',
      'invalid-sender': 'The sender email address is not valid or not verified.',
      'reputation-problem': 'Sender reputation issue. Check your Mailchimp account status.',
      'unsigned': 'Domain authentication required. Set up DKIM/SPF records for your domain.',
      'hard-bounce': 'Recipient email address is invalid or blocked.',
      'soft-bounce': 'Temporary delivery issue. Will retry automatically.',
      'spam': 'Message was marked as spam. Review your email content.',
      'unsub': 'Recipient has unsubscribed from your mailing list.',
      'custom': 'Custom rejection rule triggered. Check your Mailchimp settings.'
    };

    return errorMessages[rejectReason] || `Unknown rejection reason: ${rejectReason}`;
  }

  async sendConfirmationEmail(data: MandrillEmailData): Promise<boolean> {
    if (!this.apiKey) {
      logger.error('Mandrill API key is not configured');
      return false;
    }

    if (!this.fromEmail) {
      logger.error('FROM_EMAIL is not configured. Cannot send email.');
      return false;
    }

    if (this.fromEmail.includes('example.com')) {
      logger.error('FROM_EMAIL is using placeholder domain. Please set a verified domain.');
      return false;
    }

    try {
      const { subject, html, text } = this.getEmailContent(data);
      
      const message: MandrillMessage = {
        html,
        text,
        subject,
        from_email: this.fromEmail,
        from_name: this.fromName,
        to: [
          {
            email: data.email,
            name: "",
            type: "to"
          }
        ]
      };
     
    //   logger.info('Attempting to send email via Mandrill', {
    //     to: data.email,
    //     from: this.fromEmail,
    //     subject: subject,
    //     moduleType: data.moduleType
    //   });
      const response = await axios.post(
        `${this.apiUrl}/messages/send.json`,
        {
          key: this.apiKey,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const result = response.data[0];
        
        if (result.status === 'sent' || result.status === 'queued') {
        //   logger.info('Confirmation email sent successfully', {
        //     email: data.email,
        //     moduleType: data.moduleType,
        //     messageId: result._id,
        //     status: result.status
        //   });
          return true;
        } else {
          const helpfulMessage = this.getHelpfulErrorMessage(result.reject_reason);
          
        //   logger.error('Failed to send confirmation email', {
        //     email: data.email,
        //     moduleType: data.moduleType,
        //     status: result.status,
        //     rejectReason: result.reject_reason,
        //     helpfulMessage: helpfulMessage,
        //     fromEmail: this.fromEmail
        //   });
          
          // Also log to console for immediate debugging
          console.error('Mandrill Email Failed:', {
            status: result.status,
            rejectReason: result.reject_reason,
            helpfulMessage: helpfulMessage,
            fromEmail: this.fromEmail,
            toEmail: data.email
          });
          
          return false;
        }
      } else {
        logger.error('Unexpected response from Mandrill API', {
          email: data.email,
          moduleType: data.moduleType,
          response: response.data
        });
        return false;
      }
    } catch (error) {
      logger.error('Error sending confirmation email via Mandrill', {
        email: data.email,
        moduleType: data.moduleType,
        fromEmail: this.fromEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Also log to console for immediate debugging
      console.error('Mandrill API Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fromEmail: this.fromEmail,
        toEmail: data.email
      });
      
      return false;
    }
  }

  // Method to test Mandrill configuration
  async testConfiguration(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'MANDRILL_API_KEY is not set' };
    }

    if (!this.fromEmail) {
      return { success: false, message: 'FROM_EMAIL is not set' };
    }

    if (this.fromEmail.includes('example.com')) {
      return { success: false, message: 'FROM_EMAIL is using placeholder domain (example.com)' };
    }

    try {
      // Test API connection with ping endpoint
      const response = await axios.post(
        `${this.apiUrl}/users/ping`,
        { key: this.apiKey },
        { timeout: 5000 }
      );

      if (response.data === 'PONG!') {
        return { 
          success: true, 
          message: `Mandrill configuration is valid. Using FROM_EMAIL: ${this.fromEmail}` 
        };
      } else {
        return { success: false, message: 'Invalid Mandrill API response' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Mandrill API error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const mandrillService = new MandrillService(); 