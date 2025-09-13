import nodemailer from 'nodemailer';
import { PortfolioComment, Contact, NewsletterSubscriber } from '../models';

export class CommunicationService {
  private static transporter: nodemailer.Transporter;

  // Initialize email transporter
  static initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send email notification
  static async sendEmailNotification(to: string, subject: string, html: string, text?: string) {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@portfolio.com',
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Notify admin about new comment
  static async notifyNewComment(comment: any) {
    try {
      const subject = `New Comment on ${comment.postType}: ${comment.postId}`;
      const html = `
        <h2>New Comment Received</h2>
        <p><strong>Author:</strong> ${comment.author.name}</p>
        <p><strong>Email:</strong> ${comment.author.email}</p>
        <p><strong>Post:</strong> ${comment.postType} - ${comment.postId}</p>
        <p><strong>Comment:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${comment.content}
        </div>
        <p><strong>Status:</strong> ${comment.status}</p>
        <p><strong>Submitted:</strong> ${comment.createdAt}</p>
        <hr>
        <p><a href="${process.env.ADMIN_URL}/comments/${comment._id}">Review Comment</a></p>
      `;

      await this.sendEmailNotification(
        process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        subject,
        html
      );
    } catch (error) {
      console.error('Error notifying about new comment:', error);
    }
  }

  // Notify admin about new contact form submission
  static async notifyNewContact(contact: any) {
    try {
      const subject = `New Contact Form Submission: ${contact.subject}`;
      const html = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${contact.message}
        </div>
        <p><strong>Submitted:</strong> ${contact.createdAt}</p>
        <hr>
        <p><a href="${process.env.ADMIN_URL}/contacts/${contact._id}">View Contact</a></p>
      `;

      await this.sendEmailNotification(
        process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        subject,
        html
      );
    } catch (error) {
      console.error('Error notifying about new contact:', error);
    }
  }

  // Send welcome email to newsletter subscriber
  static async sendWelcomeEmail(subscriber: any) {
    try {
      const subject = 'Welcome to Our Newsletter!';
      const html = `
        <h2>Welcome to Our Newsletter!</h2>
        <p>Hi ${subscriber.firstName || 'there'},</p>
        <p>Thank you for subscribing to our newsletter! We're excited to share our latest updates, projects, and insights with you.</p>
        
        <h3>What to expect:</h3>
        <ul>
          <li>Latest project updates</li>
          <li>Technical blog posts</li>
          <li>Industry insights</li>
          <li>Exclusive content</li>
        </ul>
        
        <p>We respect your privacy and will only send you relevant content based on your preferences.</p>
        
        <p>If you ever want to unsubscribe, you can do so by clicking the link at the bottom of any email.</p>
        
        <p>Best regards,<br>The Portfolio Team</p>
        
        <hr>
        <p><small>You can update your preferences or unsubscribe <a href="${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${subscriber.email}">here</a>.</small></p>
      `;

      await this.sendEmailNotification(
        subscriber.email,
        subject,
        html
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  // Send newsletter campaign
  static async sendNewsletterCampaign(campaign: any, subscribers: any[]) {
    try {
      let sentCount = 0;
      let failedCount = 0;

      for (const subscriber of subscribers) {
        try {
          const personalizedHtml = this.personalizeNewsletter(campaign.htmlContent, subscriber);
          
          await this.sendEmailNotification(
            subscriber.email,
            campaign.subject,
            personalizedHtml
          );
          
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failedCount++;
        }
      }

      // Update campaign stats
      campaign.recipients.sent = sentCount;
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      await campaign.save();

      return { sentCount, failedCount };
    } catch (error) {
      console.error('Error sending newsletter campaign:', error);
      throw error;
    }
  }

  // Personalize newsletter content
  static personalizeNewsletter(htmlContent: string, subscriber: any) {
    let personalizedContent = htmlContent;
    
    // Replace placeholders
    personalizedContent = personalizedContent.replace(/{{firstName}}/g, subscriber.firstName || '');
    personalizedContent = personalizedContent.replace(/{{lastName}}/g, subscriber.lastName || '');
    personalizedContent = personalizedContent.replace(/{{email}}/g, subscriber.email);
    personalizedContent = personalizedContent.replace(/{{unsubscribeLink}}/g, 
      `${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${subscriber.email}`);
    
    return personalizedContent;
  }

  // Send comment approval notification
  static async notifyCommentApproval(comment: any) {
    try {
      const subject = 'Your Comment Has Been Approved';
      const html = `
        <h2>Comment Approved</h2>
        <p>Hi ${comment.author.name},</p>
        <p>Great news! Your comment has been approved and is now visible on our website.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${comment.content}
        </div>
        
        <p>Thank you for contributing to the discussion!</p>
        
        <p>Best regards,<br>The Portfolio Team</p>
      `;

      await this.sendEmailNotification(
        comment.author.email,
        subject,
        html
      );
    } catch (error) {
      console.error('Error notifying comment approval:', error);
    }
  }

  // Send contact form auto-reply
  static async sendContactAutoReply(contact: any) {
    try {
      const subject = 'Thank you for contacting us';
      const html = `
        <h2>Thank You for Your Message</h2>
        <p>Hi ${contact.name},</p>
        <p>Thank you for reaching out to us! We've received your message and will get back to you as soon as possible.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Message:</strong> ${contact.message}</p>
        </div>
        
        <p>We typically respond within 24 hours during business days.</p>
        
        <p>Best regards,<br>The Portfolio Team</p>
      `;

      await this.sendEmailNotification(
        contact.email,
        subject,
        html
      );
    } catch (error) {
      console.error('Error sending contact auto-reply:', error);
    }
  }

  // Send system alert
  static async sendSystemAlert(subject: string, message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    try {
      const alertHtml = `
        <h2>System Alert - ${severity.toUpperCase()}</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `;

      await this.sendEmailNotification(
        process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        `[ALERT] ${subject}`,
        alertHtml
      );
    } catch (error) {
      console.error('Error sending system alert:', error);
    }
  }

  // Send weekly analytics report
  static async sendWeeklyAnalyticsReport(analytics: any) {
    try {
      const subject = 'Weekly Portfolio Analytics Report';
      const html = `
        <h2>Weekly Portfolio Analytics Report</h2>
        <p>Here's your weekly portfolio performance summary:</p>
        
        <h3>Overview</h3>
        <ul>
          <li><strong>Page Views:</strong> ${analytics.totalPageViews}</li>
          <li><strong>Unique Visitors:</strong> ${analytics.totalUniqueVisitors}</li>
          <li><strong>Comments:</strong> ${analytics.totalComments}</li>
          <li><strong>Likes:</strong> ${analytics.totalLikes}</li>
        </ul>
        
        <h3>Top Pages</h3>
        <ol>
          ${analytics.topPages.slice(0, 5).map((page: any) => 
            `<li>${page.path} - ${page.views} views</li>`
          ).join('')}
        </ol>
        
        <h3>Device Breakdown</h3>
        <ul>
          ${Object.entries(analytics.deviceBreakdown).map(([device, count]) => 
            `<li>${device}: ${count} visitors</li>`
          ).join('')}
        </ul>
        
        <p>View detailed analytics in your admin dashboard.</p>
        
        <p>Best regards,<br>Portfolio Analytics</p>
      `;

      await this.sendEmailNotification(
        process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        subject,
        html
      );
    } catch (error) {
      console.error('Error sending weekly analytics report:', error);
    }
  }
}

export default CommunicationService;
