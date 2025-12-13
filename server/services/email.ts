/**
 * ALTUS INK - EMAIL SERVICE
 * Multi-provider email system with templates, queuing, and tracking
 * 
 * Features:
 * - SendGrid and Resend provider support
 * - HTML/Text email templates
 * - Booking confirmations, reminders, cancellations
 * - Artist notifications
 * - Email queuing with retry
 * - Template rendering with variables
 * - Email tracking and analytics
 * - Internationalization support
 */

import { config, emailConfig, features } from "../config";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailParams {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, string>;
  scheduledAt?: Date;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  artistName: string;
  artistEmail: string;
  bookingId: string;
  bookingDate: Date;
  bookingTime: string;
  duration: number;
  depositAmount: number;
  currency: string;
  location: string;
  notes?: string;
  cancellationPolicy: string;
  locale?: string;
}

export interface ReminderEmailData extends BookingEmailData {
  hoursUntil: number;
}

export interface CancellationEmailData extends BookingEmailData {
  refundAmount: number;
  cancellationReason?: string;
  cancelledBy: "customer" | "artist" | "system";
}

export type EmailTemplate =
  | "booking_confirmation"
  | "booking_reminder_24h"
  | "booking_reminder_2h"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "artist_new_booking"
  | "artist_booking_cancelled"
  | "artist_payout_sent"
  | "password_reset"
  | "welcome"
  | "account_verification";

// =============================================================================
// EMAIL PROVIDERS
// =============================================================================

interface EmailProvider {
  send(params: SendEmailParams): Promise<SendResult>;
}

/**
 * SendGrid Provider
 */
class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private baseUrl = "https://api.sendgrid.com/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(params: SendEmailParams): Promise<SendResult> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    const payload = {
      personalizations: [
        {
          to: recipients.map(r => ({ email: r.email, name: r.name })),
          cc: params.cc?.map(r => ({ email: r.email, name: r.name })),
          bcc: params.bcc?.map(r => ({ email: r.email, name: r.name })),
        }
      ],
      from: {
        email: params.from?.email || emailConfig.from,
        name: params.from?.name || emailConfig.fromName
      },
      reply_to: params.replyTo ? {
        email: params.replyTo.email,
        name: params.replyTo.name
      } : undefined,
      subject: params.subject,
      content: [
        { type: "text/plain", value: params.text || stripHtml(params.html) },
        { type: "text/html", value: params.html }
      ],
      attachments: params.attachments?.map(a => ({
        filename: a.filename,
        content: typeof a.content === "string" ? a.content : a.content.toString("base64"),
        type: a.contentType || "application/octet-stream"
      })),
      categories: params.tags,
      custom_args: params.metadata,
      send_at: params.scheduledAt ? Math.floor(params.scheduledAt.getTime() / 1000) : undefined
    };

    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const messageId = response.headers.get("X-Message-Id") || undefined;
      return { success: true, messageId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Resend Provider
 */
class ResendProvider implements EmailProvider {
  private apiKey: string;
  private baseUrl = "https://api.resend.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(params: SendEmailParams): Promise<SendResult> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    const payload = {
      from: `${params.from?.name || emailConfig.fromName} <${params.from?.email || emailConfig.from}>`,
      to: recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email),
      cc: params.cc?.map(r => r.name ? `${r.name} <${r.email}>` : r.email),
      bcc: params.bcc?.map(r => r.name ? `${r.name} <${r.email}>` : r.email),
      reply_to: params.replyTo?.email,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments?.map(a => ({
        filename: a.filename,
        content: typeof a.content === "string" ? a.content : a.content.toString("base64")
      })),
      tags: params.tags?.map(t => ({ name: t, value: "true" })),
      scheduled_at: params.scheduledAt?.toISOString()
    };

    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to send email" };
      }

      return { success: true, messageId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Console Provider (for development)
 */
class ConsoleProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<SendResult> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    console.log("\n========== EMAIL SENT ==========");
    console.log(`To: ${recipients.map(r => `${r.name || ""} <${r.email}>`).join(", ")}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`From: ${params.from?.name || emailConfig.fromName} <${params.from?.email || emailConfig.from}>`);
    console.log("---");
    console.log(params.text || stripHtml(params.html).slice(0, 500));
    console.log("================================\n");

    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

// =============================================================================
// EMAIL SERVICE
// =============================================================================

class EmailService {
  private provider: EmailProvider;
  private queue: Array<{ params: SendEmailParams; retries: number }> = [];
  private processing = false;

  constructor() {
    this.provider = this.initProvider();
    this.startQueueProcessor();
  }

  private initProvider(): EmailProvider {
    if (!features.email) {
      console.warn("⚠️ Email not configured - using console provider");
      return new ConsoleProvider();
    }

    if (emailConfig.provider === "resend" && emailConfig.apiKey) {
      return new ResendProvider(emailConfig.apiKey);
    }

    if (emailConfig.provider === "sendgrid" && emailConfig.apiKey) {
      return new SendGridProvider(emailConfig.apiKey);
    }

    return new ConsoleProvider();
  }

  private startQueueProcessor(): void {
    setInterval(() => this.processQueue(), 5000);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      const result = await this.provider.send(item.params);

      if (!result.success && item.retries < 3) {
        // Re-queue with exponential backoff
        setTimeout(() => {
          this.queue.push({ params: item.params, retries: item.retries + 1 });
        }, Math.pow(2, item.retries) * 1000);
      }
    }

    this.processing = false;
  }

  /**
   * Send email immediately
   */
  async send(params: SendEmailParams): Promise<SendResult> {
    return this.provider.send(params);
  }

  /**
   * Queue email for sending
   */
  queue_email(params: SendEmailParams): void {
    this.queue.push({ params, retries: 0 });
  }

  /**
   * Send booking confirmation to customer
   */
  async sendBookingConfirmation(data: BookingEmailData): Promise<SendResult> {
    const html = renderTemplate("booking_confirmation", data);

    return this.send({
      to: { email: data.customerEmail, name: data.customerName },
      subject: `Booking Confirmed - ${formatDate(data.bookingDate)} with ${data.artistName}`,
      html,
      tags: ["booking", "confirmation"],
      metadata: { bookingId: data.bookingId }
    });
  }

  /**
   * Send reminder to customer
   */
  async sendBookingReminder(data: ReminderEmailData): Promise<SendResult> {
    const templateName = data.hoursUntil <= 2 ? "booking_reminder_2h" : "booking_reminder_24h";
    const html = renderTemplate(templateName, data);

    return this.send({
      to: { email: data.customerEmail, name: data.customerName },
      subject: `Reminder: Your tattoo session is in ${data.hoursUntil} hours`,
      html,
      tags: ["booking", "reminder"],
      metadata: { bookingId: data.bookingId }
    });
  }

  /**
   * Send cancellation notice to customer
   */
  async sendCancellationNotice(data: CancellationEmailData): Promise<SendResult> {
    const html = renderTemplate("booking_cancelled", data);

    return this.send({
      to: { email: data.customerEmail, name: data.customerName },
      subject: `Booking Cancelled - ${formatDate(data.bookingDate)}`,
      html,
      tags: ["booking", "cancellation"],
      metadata: { bookingId: data.bookingId }
    });
  }

  /**
   * Notify artist of new booking
   */
  async notifyArtistNewBooking(data: BookingEmailData): Promise<SendResult> {
    const html = renderTemplate("artist_new_booking", data);

    return this.send({
      to: { email: data.artistEmail, name: data.artistName },
      subject: `New Booking: ${data.customerName} on ${formatDate(data.bookingDate)}`,
      html,
      tags: ["artist", "new_booking"],
      metadata: { bookingId: data.bookingId }
    });
  }

  /**
   * Notify artist of cancellation
   */
  async notifyArtistCancellation(data: CancellationEmailData): Promise<SendResult> {
    const html = renderTemplate("artist_booking_cancelled", data);

    return this.send({
      to: { email: data.artistEmail, name: data.artistName },
      subject: `Booking Cancelled: ${data.customerName} - ${formatDate(data.bookingDate)}`,
      html,
      tags: ["artist", "cancellation"],
      metadata: { bookingId: data.bookingId }
    });
  }

  /**
   * Notify artist of payout
   */
  async notifyArtistPayout(params: {
    artistEmail: string;
    artistName: string;
    amount: number;
    currency: string;
    payoutDate: Date;
  }): Promise<SendResult> {
    const html = renderTemplate("artist_payout_sent", params);

    return this.send({
      to: { email: params.artistEmail, name: params.artistName },
      subject: `Payout Sent: ${formatCurrency(params.amount, params.currency)}`,
      html,
      tags: ["artist", "payout"]
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(params: {
    email: string;
    name: string;
    resetLink: string;
    expiresIn: string;
  }): Promise<SendResult> {
    const html = renderTemplate("password_reset", params);

    return this.send({
      to: { email: params.email, name: params.name },
      subject: "Reset Your Password - Altus Ink",
      html,
      tags: ["auth", "password_reset"]
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcome(params: {
    email: string;
    name: string;
    role: "artist" | "customer";
    loginUrl: string;
  }): Promise<SendResult> {
    const html = renderTemplate("welcome", params);

    return this.send({
      to: { email: params.email, name: params.name },
      subject: `Welcome to Altus Ink${params.role === "artist" ? " - Artist Portal" : ""}`,
      html,
      tags: ["onboarding", "welcome"]
    });
  }
}

// =============================================================================
// TEMPLATE RENDERING
// =============================================================================

const BRAND_COLORS = {
  primary: "#7C3AED",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  dark: "#0F2A44",
  light: "#F5F7FA",
  text: "#0B1220",
  muted: "#475569"
};

const BASE_STYLES = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: ${BRAND_COLORS.light}; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, ${BRAND_COLORS.dark} 0%, #1A3A5C 100%); padding: 32px; text-align: center; }
    .header img { height: 40px; }
    .content { padding: 40px 32px; }
    .footer { background: ${BRAND_COLORS.light}; padding: 24px 32px; text-align: center; font-size: 12px; color: ${BRAND_COLORS.muted}; }
    h1 { color: ${BRAND_COLORS.text}; font-size: 24px; margin: 0 0 16px; }
    h2 { color: ${BRAND_COLORS.text}; font-size: 18px; margin: 24px 0 12px; }
    p { color: ${BRAND_COLORS.muted}; line-height: 1.6; margin: 0 0 16px; }
    .highlight { background: ${BRAND_COLORS.light}; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .highlight-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; }
    .highlight-row:last-child { border-bottom: none; }
    .highlight-label { color: ${BRAND_COLORS.muted}; font-size: 14px; }
    .highlight-value { color: ${BRAND_COLORS.text}; font-weight: 600; }
    .btn { display: inline-block; background: ${BRAND_COLORS.primary}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .btn-secondary { background: ${BRAND_COLORS.dark}; }
    .amount { font-size: 32px; font-weight: 700; color: ${BRAND_COLORS.success}; }
    .warning { background: #FEF3CD; border-left: 4px solid ${BRAND_COLORS.warning}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .success { background: #D1FAE5; border-left: 4px solid ${BRAND_COLORS.success}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .automated { background: #EEF2FF; color: ${BRAND_COLORS.primary}; padding: 8px 16px; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 16px; }
  </style>
`;

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${BASE_STYLES}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${config.APP_URL}/logo-altus-white.png" alt="Altus Ink" />
        </div>
        <div class="content">
          <div class="automated">🤖 This is an automated message</div>
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Altus Ink. All rights reserved.</p>
          <p>This email was sent by the Altus Ink booking platform.</p>
          <p><a href="${config.APP_URL}/privacy">Privacy Policy</a> | <a href="${config.APP_URL}/terms">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderTemplate(templateName: EmailTemplate, data: any): string {
  const templates: Record<EmailTemplate, (data: any) => string> = {

    booking_confirmation: (d: BookingEmailData) => baseTemplate(`
      <h1>Booking Confirmed! ✨</h1>
      <p>Hi ${d.customerName},</p>
      <p>Your tattoo session with <strong>${d.artistName}</strong> has been confirmed. Here are your booking details:</p>
      
      <div class="highlight">
        <div class="highlight-row">
          <span class="highlight-label">Date</span>
          <span class="highlight-value">${formatDate(d.bookingDate)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Time</span>
          <span class="highlight-value">${d.bookingTime}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Duration</span>
          <span class="highlight-value">${d.duration} hours</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Location</span>
          <span class="highlight-value">${d.location}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Deposit Paid</span>
          <span class="highlight-value" style="color: ${BRAND_COLORS.success};">${formatCurrency(d.depositAmount, d.currency)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Booking ID</span>
          <span class="highlight-value" style="font-family: monospace;">${d.bookingId.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      ${d.notes ? `<h2>Your Notes</h2><p style="font-style: italic;">"${d.notes}"</p>` : ""}
      
      <div class="warning">
        <strong>Cancellation Policy:</strong> ${d.cancellationPolicy}
      </div>

      <h2>What's Next?</h2>
      <ul>
        <li>You'll receive a reminder 24 hours before your session</li>
        <li>Make sure to arrive 10 minutes early</li>
        <li>Bring a valid ID document</li>
        <li>Stay hydrated and get a good night's sleep</li>
      </ul>

      <a href="${config.APP_URL}/booking/${d.bookingId}" class="btn">View Booking Details</a>

      <p>See you soon!</p>
      <p><strong>The Altus Ink Team</strong></p>
    `),

    booking_reminder_24h: (d: ReminderEmailData) => baseTemplate(`
      <h1>Reminder: Your Session is Tomorrow! 📅</h1>
      <p>Hi ${d.customerName},</p>
      <p>Just a friendly reminder that your tattoo session with <strong>${d.artistName}</strong> is coming up tomorrow.</p>
      
      <div class="highlight">
        <div class="highlight-row">
          <span class="highlight-label">Date</span>
          <span class="highlight-value">${formatDate(d.bookingDate)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Time</span>
          <span class="highlight-value">${d.bookingTime}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Location</span>
          <span class="highlight-value">${d.location}</span>
        </div>
      </div>

      <h2>Preparation Tips</h2>
      <ul>
        <li>🥤 Stay well hydrated - drink plenty of water today and tomorrow</li>
        <li>😴 Get a good night's sleep</li>
        <li>🍽️ Eat a proper meal before your appointment</li>
        <li>🆔 Bring a valid ID document</li>
        <li>👕 Wear comfortable, loose-fitting clothes</li>
        <li>⏰ Arrive 10 minutes early</li>
      </ul>

      <div class="warning">
        <strong>Need to reschedule?</strong> Contact us at least 24 hours in advance to avoid losing your deposit.
      </div>

      <a href="${config.APP_URL}/booking/${d.bookingId}" class="btn">View Booking</a>

      <p>See you tomorrow!</p>
    `),

    booking_reminder_2h: (d: ReminderEmailData) => baseTemplate(`
      <h1>Your Session Starts Soon! ⏰</h1>
      <p>Hi ${d.customerName},</p>
      <p>Your tattoo session with <strong>${d.artistName}</strong> starts in about 2 hours.</p>
      
      <div class="success">
        <strong>📍 Location:</strong> ${d.location}<br>
        <strong>🕐 Time:</strong> ${d.bookingTime}
      </div>

      <p>Remember to:</p>
      <ul>
        <li>Arrive 10 minutes early</li>
        <li>Bring your ID</li>
        <li>Stay calm and excited! 😊</li>
      </ul>

      <p>See you very soon!</p>
    `),

    booking_cancelled: (d: CancellationEmailData) => baseTemplate(`
      <h1>Booking Cancelled</h1>
      <p>Hi ${d.customerName},</p>
      <p>Your booking with ${d.artistName} on ${formatDate(d.bookingDate)} has been cancelled.</p>
      
      ${d.refundAmount > 0 ? `
        <div class="success">
          <strong>Refund Processed</strong><br>
          Amount: <span class="amount">${formatCurrency(d.refundAmount, d.currency)}</span><br>
          <small>You should receive this within 5-10 business days.</small>
        </div>
      ` : `
        <div class="warning">
          <strong>No Refund Applicable</strong><br>
          Based on our cancellation policy, no refund is applicable for this cancellation.
        </div>
      `}

      ${d.cancellationReason ? `<p><strong>Reason:</strong> ${d.cancellationReason}</p>` : ""}

      <p>We're sorry to see this booking cancelled. We hope to see you again soon!</p>

      <a href="${config.APP_URL}/artists" class="btn">Browse Artists</a>
    `),

    booking_rescheduled: (d: any) => baseTemplate(`
      <h1>Booking Rescheduled</h1>
      <p>Hi ${d.customerName},</p>
      <p>Your booking has been rescheduled to a new date and time.</p>
      
      <div class="highlight">
        <div class="highlight-row">
          <span class="highlight-label">New Date</span>
          <span class="highlight-value">${formatDate(d.newDate)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">New Time</span>
          <span class="highlight-value">${d.newTime}</span>
        </div>
      </div>

      <a href="${config.APP_URL}/booking/${d.bookingId}" class="btn">View Updated Booking</a>
    `),

    artist_new_booking: (d: BookingEmailData) => baseTemplate(`
      <h1>New Booking Received! 🎉</h1>
      <p>Hi ${d.artistName},</p>
      <p>You have a new booking from <strong>${d.customerName}</strong>.</p>
      
      <div class="highlight">
        <div class="highlight-row">
          <span class="highlight-label">Customer</span>
          <span class="highlight-value">${d.customerName}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Email</span>
          <span class="highlight-value">${d.customerEmail}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Date</span>
          <span class="highlight-value">${formatDate(d.bookingDate)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Time</span>
          <span class="highlight-value">${d.bookingTime}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Duration</span>
          <span class="highlight-value">${d.duration} hours</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Deposit</span>
          <span class="highlight-value" style="color: ${BRAND_COLORS.success};">${formatCurrency(d.depositAmount, d.currency)}</span>
        </div>
      </div>

      ${d.notes ? `
        <h2>Customer Notes</h2>
        <p style="font-style: italic; background: ${BRAND_COLORS.light}; padding: 16px; border-radius: 8px;">"${d.notes}"</p>
      ` : ""}

      <a href="${config.APP_URL}/dashboard/artist/bookings/${d.bookingId}" class="btn">View Booking Details</a>
    `),

    artist_booking_cancelled: (d: CancellationEmailData) => baseTemplate(`
      <h1>Booking Cancelled</h1>
      <p>Hi ${d.artistName},</p>
      <p>The following booking has been cancelled:</p>
      
      <div class="highlight">
        <div class="highlight-row">
          <span class="highlight-label">Customer</span>
          <span class="highlight-value">${d.customerName}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Date</span>
          <span class="highlight-value">${formatDate(d.bookingDate)}</span>
        </div>
        <div class="highlight-row">
          <span class="highlight-label">Cancelled By</span>
          <span class="highlight-value">${d.cancelledBy}</span>
        </div>
      </div>

      ${d.cancellationReason ? `<p><strong>Reason:</strong> ${d.cancellationReason}</p>` : ""}

      <p>This time slot is now available for new bookings.</p>

      <a href="${config.APP_URL}/dashboard/artist/calendar" class="btn">View Calendar</a>
    `),

    artist_payout_sent: (d: any) => baseTemplate(`
      <h1>Payout Sent! 💰</h1>
      <p>Hi ${d.artistName},</p>
      <p>Great news! Your payout has been processed.</p>
      
      <div style="text-align: center; padding: 24px;">
        <p class="amount">${formatCurrency(d.amount, d.currency)}</p>
        <p style="color: ${BRAND_COLORS.muted};">Sent on ${formatDate(d.payoutDate)}</p>
      </div>

      <p>The funds should arrive in your bank account within 1-2 business days.</p>

      <a href="${config.APP_URL}/dashboard/artist/earnings" class="btn">View Earnings</a>
    `),

    password_reset: (d: any) => baseTemplate(`
      <h1>Reset Your Password</h1>
      <p>Hi ${d.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="${d.resetLink}" class="btn">Reset Password</a>
      </div>

      <p>This link will expire in ${d.expiresIn}.</p>

      <div class="warning">
        <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not be changed.
      </div>
    `),

    welcome: (d: any) => baseTemplate(`
      <h1>Welcome to Altus Ink! 🎨</h1>
      <p>Hi ${d.name},</p>
      <p>Welcome to the Altus Ink platform! We're excited to have you on board.</p>
      
      ${d.role === "artist" ? `
        <h2>Getting Started as an Artist</h2>
        <ol>
          <li>Complete your profile with your bio and specialty</li>
          <li>Upload your portfolio images</li>
          <li>Connect your Stripe account for payments</li>
          <li>Set up your calendar and availability</li>
        </ol>
      ` : `
        <h2>What You Can Do</h2>
        <ul>
          <li>Browse our talented artists</li>
          <li>Book your tattoo sessions</li>
          <li>Manage your appointments</li>
        </ul>
      `}

      <a href="${d.loginUrl}" class="btn">Go to Dashboard</a>

      <p>If you have any questions, don't hesitate to reach out!</p>
      <p><strong>The Altus Ink Team</strong></p>
    `),

    account_verification: (d: any) => baseTemplate(`
      <h1>Verify Your Email</h1>
      <p>Hi ${d.name},</p>
      <p>Please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${d.verificationLink}" class="btn">Verify Email</a>
      </div>

      <p>This link will expire in 24 hours.</p>
    `)
  };

  const template = templates[templateName];
  return template ? template(data) : "";
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatCurrency(amount: number, currency: string = "eur"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const emailService = new EmailService();

export default emailService;
