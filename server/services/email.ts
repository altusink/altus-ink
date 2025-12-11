import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  initialize(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
    console.log("Email service initialized with host:", config.host);
  }

  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.config) {
      console.warn("Email service not configured - skipping email send");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      });

      console.log("Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async sendBookingConfirmation(params: {
    to: string;
    customerName: string;
    artistName: string;
    date: string;
    time: string;
    depositAmount: string;
    currency: string;
    locale?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Booking Confirmed - ${params.artistName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; width: 120px; color: #666; }
          .detail-value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          .gold-text { color: #D4AF37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Booking Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">ALTUSINK.IO</p>
          </div>
          <div class="content">
            <p>Hello <strong>${params.customerName}</strong>,</p>
            <p>Your booking with <strong class="gold-text">${params.artistName}</strong> has been confirmed!</p>
            
            <h3 style="color: #D4AF37; margin-top: 25px;">Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${params.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${params.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Deposit Paid:</span>
              <span class="detail-value">${params.currency} ${params.depositAmount}</span>
            </div>
            
            <p style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #D4AF37;">
              <strong>Important:</strong> Please arrive 10 minutes before your scheduled time. 
              The remaining balance will be due at the studio.
            </p>
            
            <p style="margin-top: 20px;">If you need to reschedule or have any questions, please contact the artist directly.</p>
          </div>
          <div class="footer">
            <p>Powered by ALTUSINK.IO</p>
            <p style="color: #aaa;">This email was sent regarding your tattoo booking.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({ to: params.to, subject, html });
  }

  async sendDepositReminder(params: {
    to: string;
    customerName: string;
    artistName: string;
    date: string;
    time: string;
    hoursUntil: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Reminder: Your appointment with ${params.artistName} is in ${params.hoursUntil} hours`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${params.customerName}</strong>,</p>
            <p>This is a friendly reminder that your tattoo appointment with <strong>${params.artistName}</strong> is coming up!</p>
            
            <p style="font-size: 18px; background: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <strong>${params.date}</strong> at <strong>${params.time}</strong>
            </p>
            
            <p>Please remember to:</p>
            <ul>
              <li>Arrive 10 minutes early</li>
              <li>Bring a valid ID</li>
              <li>Get a good night's sleep</li>
              <li>Eat a meal before your session</li>
            </ul>
          </div>
          <div class="footer">
            <p>Powered by ALTUSINK.IO</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({ to: params.to, subject, html });
  }

  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("Email service verified successfully");
      return true;
    } catch (error) {
      console.error("Email service verification failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
