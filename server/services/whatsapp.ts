/**
 * WHATSAPP BUSINESS API SERVICE
 * Complete WhatsApp integration for Altus Ink
 * 
 * Features:
 * - Message templates
 * - Booking notifications
 * - Reminders
 * - Customer support
 * - Media messages
 * - Interactive messages
 * - Webhooks
 * - Message queuing
 * - Rate limiting
 * - Analytics
 */

import Stripe from "stripe";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  apiVersion: string;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  type: MessageType;
  template?: TemplateMessage;
  text?: TextMessage;
  image?: MediaMessage;
  document?: MediaMessage;
  interactive?: InteractiveMessage;
  status: MessageStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type MessageType =
  | "template"
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "sticker"
  | "location"
  | "contacts"
  | "interactive";

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface TemplateMessage {
  name: string;
  language: TemplateLanguage;
  components?: TemplateComponent[];
}

export interface TemplateLanguage {
  code: string;
  policy?: "deterministic" | "fallback";
}

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters?: TemplateParameter[];
  sub_type?: "quick_reply" | "url";
  index?: number;
}

export interface TemplateParameter {
  type: "text" | "currency" | "date_time" | "image" | "document" | "video";
  text?: string;
  currency?: CurrencyParameter;
  date_time?: DateTimeParameter;
  image?: MediaParameter;
  document?: MediaParameter;
  video?: MediaParameter;
}

export interface CurrencyParameter {
  fallback_value: string;
  code: string;
  amount_1000: number;
}

export interface DateTimeParameter {
  fallback_value: string;
  day_of_week?: number;
  day_of_month?: number;
  year?: number;
  month?: number;
  hour?: number;
  minute?: number;
}

export interface MediaParameter {
  link?: string;
  id?: string;
  caption?: string;
  filename?: string;
}

export interface TextMessage {
  body: string;
  preview_url?: boolean;
}

export interface MediaMessage {
  link?: string;
  id?: string;
  caption?: string;
  filename?: string;
}

export interface InteractiveMessage {
  type: "button" | "list" | "product" | "product_list";
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: InteractiveAction;
}

export interface InteractiveHeader {
  type: "text" | "image" | "video" | "document";
  text?: string;
  image?: MediaParameter;
  video?: MediaParameter;
  document?: MediaParameter;
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveAction {
  button?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveSection[];
  catalog_id?: string;
  product_retailer_id?: string;
}

export interface InteractiveButton {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveSection {
  title?: string;
  rows: InteractiveSectionRow[];
}

export interface InteractiveSectionRow {
  id: string;
  title: string;
  description?: string;
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export interface WebhookStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: {
      details: string;
    };
  }>;
}

export interface ConversationContext {
  phoneNumber: string;
  customerName?: string;
  artistId?: string;
  bookingId?: string;
  lastMessageAt: Date;
  state: ConversationState;
  data: Record<string, any>;
}

export type ConversationState =
  | "idle"
  | "awaiting_name"
  | "awaiting_email"
  | "awaiting_booking_selection"
  | "awaiting_confirmation"
  | "awaiting_support_topic"
  | "connected_to_agent";

export interface MessageQueueItem {
  id: string;
  message: WhatsAppMessage;
  priority: "high" | "normal" | "low";
  scheduledAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export interface WhatsAppAnalytics {
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  messagesByType: Record<MessageType, number>;
  responseTime: {
    average: number;
    median: number;
    p95: number;
  };
  conversionRate: number;
  topTemplates: Array<{
    name: string;
    sent: number;
    delivered: number;
    read: number;
  }>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const WHATSAPP_API_URL = "https://graph.facebook.com";
const DEFAULT_API_VERSION = "v18.0";

const RATE_LIMITS = {
  messagesPerSecond: 80,
  messagesPerMinute: 1000,
  messagesPerDay: 100000,
  templatesPerDay: 100000
};

const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000
};

// Message templates approved for WhatsApp Business API
const APPROVED_TEMPLATES = {
  // Booking confirmations
  booking_confirmation: {
    name: "booking_confirmation",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["header_image", "body", "footer", "buttons"]
  },
  booking_reminder_24h: {
    name: "booking_reminder_24h",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body", "buttons"]
  },
  booking_reminder_2h: {
    name: "booking_reminder_2h",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body", "buttons"]
  },
  booking_cancelled: {
    name: "booking_cancelled",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body"]
  },
  booking_rescheduled: {
    name: "booking_rescheduled",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body", "buttons"]
  },

  // Payment notifications
  payment_received: {
    name: "payment_received",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body"]
  },
  payment_failed: {
    name: "payment_failed",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body", "buttons"]
  },
  refund_processed: {
    name: "refund_processed",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body"]
  },

  // Artist notifications
  artist_new_booking: {
    name: "artist_new_booking",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body", "buttons"]
  },
  artist_payout_sent: {
    name: "artist_payout_sent",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body"]
  },

  // Support & Authentication
  verification_code: {
    name: "verification_code",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["body"]
  },
  welcome_message: {
    name: "welcome_message",
    languages: ["en", "pt", "nl", "de", "es", "fr"],
    components: ["header_image", "body", "buttons"]
  }
};

// Template content by language
const TEMPLATE_CONTENT: Record<string, Record<string, { header?: string; body: string; footer?: string; buttons?: string[] }>> = {
  booking_confirmation: {
    en: {
      header: "Booking Confirmed! ✅",
      body: "Hi {{1}}, your tattoo session is confirmed!\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n👨‍🎨 Artist: {{4}}\n📍 Location: {{5}}\n\nDeposit paid: €{{6}}\n\nPlease arrive 10 minutes early.",
      footer: "Altus Ink - Premium Tattoo Booking",
      buttons: ["View Booking", "Get Directions"]
    },
    pt: {
      header: "Reserva Confirmada! ✅",
      body: "Olá {{1}}, a sua sessão de tatuagem está confirmada!\n\n📅 Data: {{2}}\n⏰ Hora: {{3}}\n👨‍🎨 Artista: {{4}}\n📍 Local: {{5}}\n\nDepósito pago: €{{6}}\n\nPor favor, chegue 10 minutos antes.",
      footer: "Altus Ink - Reservas Premium de Tatuagem",
      buttons: ["Ver Reserva", "Obter Direções"]
    },
    nl: {
      header: "Boeking Bevestigd! ✅",
      body: "Hoi {{1}}, je tattoo sessie is bevestigd!\n\n📅 Datum: {{2}}\n⏰ Tijd: {{3}}\n👨‍🎨 Artiest: {{4}}\n📍 Locatie: {{5}}\n\nAanbetaling: €{{6}}\n\nKom 10 minuten eerder.",
      footer: "Altus Ink - Premium Tattoo Boeking",
      buttons: ["Bekijk Boeking", "Route"]
    },
    de: {
      header: "Buchung Bestätigt! ✅",
      body: "Hallo {{1}}, deine Tattoo-Session ist bestätigt!\n\n📅 Datum: {{2}}\n⏰ Uhrzeit: {{3}}\n👨‍🎨 Künstler: {{4}}\n📍 Ort: {{5}}\n\nAngezahlt: €{{6}}\n\nBitte komme 10 Minuten früher.",
      footer: "Altus Ink - Premium Tattoo Buchung",
      buttons: ["Buchung ansehen", "Route"]
    },
    es: {
      header: "¡Reserva Confirmada! ✅",
      body: "Hola {{1}}, ¡tu sesión de tatuaje está confirmada!\n\n📅 Fecha: {{2}}\n⏰ Hora: {{3}}\n👨‍🎨 Artista: {{4}}\n📍 Ubicación: {{5}}\n\nDepósito pagado: €{{6}}\n\nPor favor, llega 10 minutos antes.",
      footer: "Altus Ink - Reservas Premium de Tatuajes",
      buttons: ["Ver Reserva", "Cómo Llegar"]
    },
    fr: {
      header: "Réservation Confirmée! ✅",
      body: "Bonjour {{1}}, votre séance de tatouage est confirmée!\n\n📅 Date: {{2}}\n⏰ Heure: {{3}}\n👨‍🎨 Artiste: {{4}}\n📍 Lieu: {{5}}\n\nAcompte payé: €{{6}}\n\nVeuillez arriver 10 minutes en avance.",
      footer: "Altus Ink - Réservation Tatouage Premium",
      buttons: ["Voir Réservation", "Itinéraire"]
    }
  },
  booking_reminder_24h: {
    en: {
      body: "⏰ Reminder: Your tattoo session is tomorrow!\n\n📅 {{1}} at {{2}}\n👨‍🎨 With {{3}}\n📍 {{4}}\n\nRemember to:\n• Get a good night's sleep\n• Eat a meal before your session\n• Stay hydrated\n• Avoid alcohol 24h before\n\nSee you soon! 💉",
      buttons: ["Confirm Attendance", "Reschedule"]
    },
    pt: {
      body: "⏰ Lembrete: A sua sessão de tatuagem é amanhã!\n\n📅 {{1}} às {{2}}\n👨‍🎨 Com {{3}}\n📍 {{4}}\n\nLembre-se de:\n• Dormir bem\n• Comer antes da sessão\n• Manter-se hidratado\n• Evitar álcool 24h antes\n\nAté breve! 💉",
      buttons: ["Confirmar Presença", "Reagendar"]
    },
    nl: {
      body: "⏰ Herinnering: Je tattoo sessie is morgen!\n\n📅 {{1}} om {{2}}\n👨‍🎨 Met {{3}}\n📍 {{4}}\n\nVergeet niet om:\n• Goed te slapen\n• Te eten voor de sessie\n• Gehydrateerd te blijven\n• 24u geen alcohol te drinken\n\nTot gauw! 💉",
      buttons: ["Bevestig Aanwezigheid", "Verzetten"]
    },
    de: {
      body: "⏰ Erinnerung: Deine Tattoo-Session ist morgen!\n\n📅 {{1}} um {{2}}\n👨‍🎨 Mit {{3}}\n📍 {{4}}\n\nDenke daran:\n• Gut zu schlafen\n• Vor der Session zu essen\n• Hydratisiert zu bleiben\n• 24h keinen Alkohol zu trinken\n\nBis bald! 💉",
      buttons: ["Anwesenheit bestätigen", "Verschieben"]
    },
    es: {
      body: "⏰ Recordatorio: ¡Tu sesión de tatuaje es mañana!\n\n📅 {{1}} a las {{2}}\n👨‍🎨 Con {{3}}\n📍 {{4}}\n\nRecuerda:\n• Dormir bien\n• Comer antes de la sesión\n• Mantenerte hidratado\n• Evitar alcohol 24h antes\n\n¡Hasta pronto! 💉",
      buttons: ["Confirmar Asistencia", "Reagendar"]
    },
    fr: {
      body: "⏰ Rappel: Votre séance de tatouage est demain!\n\n📅 {{1}} à {{2}}\n👨‍🎨 Avec {{3}}\n📍 {{4}}\n\nN'oubliez pas de:\n• Bien dormir\n• Manger avant la séance\n• Rester hydraté\n• Éviter l'alcool 24h avant\n\nÀ bientôt! 💉",
      buttons: ["Confirmer Présence", "Reporter"]
    }
  },
  payment_received: {
    en: {
      body: "✅ Payment Received!\n\nThank you, {{1}}! We've received your deposit of €{{2}} for your booking on {{3}}.\n\nBooking ID: {{4}}\n\nYou can view your booking details anytime in your account.",
    },
    pt: {
      body: "✅ Pagamento Recebido!\n\nObrigado, {{1}}! Recebemos o seu depósito de €{{2}} para a reserva de {{3}}.\n\nID da Reserva: {{4}}\n\nPode ver os detalhes da sua reserva a qualquer momento na sua conta.",
    },
    nl: {
      body: "✅ Betaling Ontvangen!\n\nBedankt, {{1}}! We hebben je aanbetaling van €{{2}} ontvangen voor je boeking op {{3}}.\n\nBoeking ID: {{4}}\n\nJe kunt je boekingsdetails altijd bekijken in je account.",
    },
    de: {
      body: "✅ Zahlung Erhalten!\n\nDanke, {{1}}! Wir haben deine Anzahlung von €{{2}} für deine Buchung am {{3}} erhalten.\n\nBuchungs-ID: {{4}}\n\nDu kannst deine Buchungsdetails jederzeit in deinem Konto einsehen.",
    },
    es: {
      body: "✅ ¡Pago Recibido!\n\nGracias, {{1}}! Hemos recibido tu depósito de €{{2}} para tu reserva del {{3}}.\n\nID de Reserva: {{4}}\n\nPuedes ver los detalles de tu reserva en cualquier momento en tu cuenta.",
    },
    fr: {
      body: "✅ Paiement Reçu!\n\nMerci, {{1}}! Nous avons reçu votre acompte de €{{2}} pour votre réservation du {{3}}.\n\nID de Réservation: {{4}}\n\nVous pouvez consulter les détails de votre réservation à tout moment dans votre compte.",
    }
  },
  artist_new_booking: {
    en: {
      body: "🎨 New Booking Alert!\n\nYou have a new booking request:\n\n👤 Customer: {{1}}\n📅 Date: {{2}}\n⏰ Time: {{3}}\n⏱️ Duration: {{4}} hours\n📱 Phone: {{5}}\n\n💰 Deposit: €{{6}}\n\nPlease confirm or contact the customer.",
      buttons: ["View Details", "Contact Customer"]
    },
    pt: {
      body: "🎨 Nova Reserva!\n\nTem um novo pedido de reserva:\n\n👤 Cliente: {{1}}\n📅 Data: {{2}}\n⏰ Hora: {{3}}\n⏱️ Duração: {{4}} horas\n📱 Telefone: {{5}}\n\n💰 Depósito: €{{6}}\n\nPor favor confirme ou contacte o cliente.",
      buttons: ["Ver Detalhes", "Contactar Cliente"]
    },
    nl: {
      body: "🎨 Nieuwe Boeking!\n\nJe hebt een nieuwe boekingsaanvraag:\n\n👤 Klant: {{1}}\n📅 Datum: {{2}}\n⏰ Tijd: {{3}}\n⏱️ Duur: {{4}} uur\n📱 Telefoon: {{5}}\n\n💰 Aanbetaling: €{{6}}\n\nBevestig of neem contact op met de klant.",
      buttons: ["Bekijk Details", "Neem Contact Op"]
    },
    de: {
      body: "🎨 Neue Buchung!\n\nDu hast eine neue Buchungsanfrage:\n\n👤 Kunde: {{1}}\n📅 Datum: {{2}}\n⏰ Uhrzeit: {{3}}\n⏱️ Dauer: {{4}} Stunden\n📱 Telefon: {{5}}\n\n💰 Anzahlung: €{{6}}\n\nBitte bestätige oder kontaktiere den Kunden.",
      buttons: ["Details ansehen", "Kunde kontaktieren"]
    },
    es: {
      body: "🎨 ¡Nueva Reserva!\n\nTienes una nueva solicitud de reserva:\n\n👤 Cliente: {{1}}\n📅 Fecha: {{2}}\n⏰ Hora: {{3}}\n⏱️ Duración: {{4}} horas\n📱 Teléfono: {{5}}\n\n💰 Depósito: €{{6}}\n\nPor favor confirma o contacta al cliente.",
      buttons: ["Ver Detalles", "Contactar Cliente"]
    },
    fr: {
      body: "🎨 Nouvelle Réservation!\n\nVous avez une nouvelle demande de réservation:\n\n👤 Client: {{1}}\n📅 Date: {{2}}\n⏰ Heure: {{3}}\n⏱️ Durée: {{4}} heures\n📱 Téléphone: {{5}}\n\n💰 Acompte: €{{6}}\n\nVeuillez confirmer ou contacter le client.",
      buttons: ["Voir Détails", "Contacter Client"]
    }
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except leading +
  let formatted = phone.replace(/[^\d+]/g, "");

  // Ensure it starts with country code
  if (!formatted.startsWith("+")) {
    // Default to Netherlands if no country code
    if (formatted.startsWith("0")) {
      formatted = "+31" + formatted.substring(1);
    } else if (formatted.startsWith("31")) {
      formatted = "+" + formatted;
    } else {
      formatted = "+31" + formatted;
    }
  }

  // Remove the + for WhatsApp API (they don't want it)
  return formatted.replace("+", "");
}

function getLanguageCode(locale: string): string {
  const langMap: Record<string, string> = {
    "en": "en",
    "en-US": "en",
    "en-GB": "en",
    "pt": "pt_PT",
    "pt-PT": "pt_PT",
    "pt-BR": "pt_BR",
    "nl": "nl",
    "nl-NL": "nl",
    "de": "de",
    "de-DE": "de",
    "es": "es",
    "es-ES": "es",
    "fr": "fr",
    "fr-FR": "fr"
  };
  return langMap[locale] || "en";
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateExponentialBackoff(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelayMs);
}

// =============================================================================
// MAIN WHATSAPP SERVICE CLASS
// =============================================================================

export class WhatsAppService {
  private config: WhatsAppConfig;
  private messageQueue: MessageQueueItem[] = [];
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private rateLimitTokens: number = RATE_LIMITS.messagesPerSecond;
  private lastRateLimitRefresh: number = Date.now();
  private analytics: WhatsAppAnalytics = {
    totalMessagesSent: 0,
    totalMessagesReceived: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
    messagesByType: {} as Record<MessageType, number>,
    responseTime: { average: 0, median: 0, p95: 0 },
    conversionRate: 0,
    topTemplates: []
  };

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "altusink_verify_token",
      apiVersion: process.env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION
    };

    // Start queue processor
    this.startQueueProcessor();

    // Start rate limit token refresh
    this.startRateLimitRefresh();
  }

  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================

  isConfigured(): boolean {
    return !!(
      this.config.accessToken &&
      this.config.phoneNumberId &&
      this.config.businessAccountId
    );
  }

  getConfig(): Partial<WhatsAppConfig> {
    return {
      phoneNumberId: this.config.phoneNumberId,
      businessAccountId: this.config.businessAccountId,
      apiVersion: this.config.apiVersion
    };
  }

  // ===========================================================================
  // TEMPLATE MESSAGES
  // ===========================================================================

  async sendBookingConfirmation(
    phone: string,
    data: {
      customerName: string;
      date: string;
      time: string;
      artistName: string;
      location: string;
      depositAmount: number;
      bookingId: string;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "booking_confirmation", locale, [
      { type: "text", text: data.customerName },
      { type: "text", text: data.date },
      { type: "text", text: data.time },
      { type: "text", text: data.artistName },
      { type: "text", text: data.location },
      { type: "text", text: data.depositAmount.toString() }
    ]);
  }

  async sendBookingReminder24h(
    phone: string,
    data: {
      date: string;
      time: string;
      artistName: string;
      location: string;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "booking_reminder_24h", locale, [
      { type: "text", text: data.date },
      { type: "text", text: data.time },
      { type: "text", text: data.artistName },
      { type: "text", text: data.location }
    ]);
  }

  async sendBookingReminder2h(
    phone: string,
    data: {
      time: string;
      artistName: string;
      location: string;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "booking_reminder_2h", locale, [
      { type: "text", text: data.time },
      { type: "text", text: data.artistName },
      { type: "text", text: data.location }
    ]);
  }

  async sendBookingCancellation(
    phone: string,
    data: {
      customerName: string;
      date: string;
      artistName: string;
      reason?: string;
      refundAmount?: number;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "booking_cancelled", locale, [
      { type: "text", text: data.customerName },
      { type: "text", text: data.date },
      { type: "text", text: data.artistName },
      { type: "text", text: data.reason || "No reason provided" },
      { type: "text", text: data.refundAmount ? `€${data.refundAmount}` : "N/A" }
    ]);
  }

  async sendPaymentReceived(
    phone: string,
    data: {
      customerName: string;
      amount: number;
      date: string;
      bookingId: string;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "payment_received", locale, [
      { type: "text", text: data.customerName },
      { type: "text", text: data.amount.toString() },
      { type: "text", text: data.date },
      { type: "text", text: data.bookingId }
    ]);
  }

  async sendArtistNewBooking(
    phone: string,
    data: {
      customerName: string;
      date: string;
      time: string;
      duration: number;
      customerPhone: string;
      depositAmount: number;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "artist_new_booking", locale, [
      { type: "text", text: data.customerName },
      { type: "text", text: data.date },
      { type: "text", text: data.time },
      { type: "text", text: data.duration.toString() },
      { type: "text", text: data.customerPhone },
      { type: "text", text: data.depositAmount.toString() }
    ]);
  }

  async sendArtistPayoutNotification(
    phone: string,
    data: {
      artistName: string;
      amount: number;
      period: string;
      bookingsCount: number;
    },
    locale: string = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplateMessage(phone, "artist_payout_sent", locale, [
      { type: "text", text: data.artistName },
      { type: "text", text: `€${data.amount.toFixed(2)}` },
      { type: "text", text: data.period },
      { type: "text", text: data.bookingsCount.toString() }
    ]);
  }

  private async sendTemplateMessage(
    phone: string,
    templateName: string,
    locale: string,
    parameters: TemplateParameter[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);
    const languageCode = getLanguageCode(locale);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters
          }
        ]
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  // ===========================================================================
  // TEXT MESSAGES
  // ===========================================================================

  async sendTextMessage(
    phone: string,
    text: string,
    previewUrl: boolean = false
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "text",
      text: {
        body: text,
        preview_url: previewUrl
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  // ===========================================================================
  // INTERACTIVE MESSAGES
  // ===========================================================================

  async sendInteractiveButtons(
    phone: string,
    body: string,
    buttons: Array<{ id: string; title: string }>,
    header?: string,
    footer?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "interactive",
      interactive: {
        type: "button",
        header: header ? { type: "text", text: header } : undefined,
        body: { text: body },
        footer: footer ? { text: footer } : undefined,
        action: {
          buttons: buttons.slice(0, 3).map(btn => ({
            type: "reply" as const,
            reply: { id: btn.id, title: btn.title.substring(0, 20) }
          }))
        }
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  async sendInteractiveList(
    phone: string,
    body: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    header?: string,
    footer?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "interactive",
      interactive: {
        type: "list",
        header: header ? { type: "text", text: header } : undefined,
        body: { text: body },
        footer: footer ? { text: footer } : undefined,
        action: {
          button: buttonText.substring(0, 20),
          sections: sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              id: row.id,
              title: row.title.substring(0, 24),
              description: row.description?.substring(0, 72)
            }))
          }))
        }
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  // ===========================================================================
  // MEDIA MESSAGES
  // ===========================================================================

  async sendImage(
    phone: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "image",
      image: {
        link: imageUrl,
        caption
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  async sendDocument(
    phone: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp not configured" };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const message: WhatsAppMessage = {
      id: generateMessageId(),
      to: formattedPhone,
      type: "document",
      document: {
        link: documentUrl,
        filename,
        caption
      },
      status: "pending",
      timestamp: new Date()
    };

    return this.sendMessage(message);
  }

  // ===========================================================================
  // CORE MESSAGE SENDING
  // ===========================================================================

  private async sendMessage(
    message: WhatsAppMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check rate limiting
      if (!this.acquireRateLimitToken()) {
        // Queue the message for later
        this.queueMessage(message, "normal");
        return {
          success: true,
          messageId: message.id,
          error: "Message queued due to rate limiting"
        };
      }

      const response = await this.callWhatsAppAPI(message);

      if (response.success) {
        this.analytics.totalMessagesSent++;
        const type = message.type;
        this.analytics.messagesByType[type] = (this.analytics.messagesByType[type] || 0) + 1;
      } else {
        this.analytics.totalFailed++;
      }

      return response;
    } catch (error) {
      console.error("WhatsApp send error:", error);
      this.analytics.totalFailed++;
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private async callWhatsAppAPI(
    message: WhatsAppMessage,
    attempt: number = 0
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const url = `${WHATSAPP_API_URL}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: message.type
    };

    // Add type-specific content
    switch (message.type) {
      case "template":
        payload.template = message.template;
        break;
      case "text":
        payload.text = message.text;
        break;
      case "image":
        payload.image = message.image;
        break;
      case "document":
        payload.document = message.document;
        break;
      case "interactive":
        payload.interactive = message.interactive;
        break;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          if (attempt < RETRY_CONFIG.maxAttempts) {
            await sleep(calculateExponentialBackoff(attempt));
            return this.callWhatsAppAPI(message, attempt + 1);
          }
        }

        return {
          success: false,
          error: data.error?.message || `HTTP ${response.status}`
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id || message.id
      };
    } catch (error) {
      if (attempt < RETRY_CONFIG.maxAttempts) {
        await sleep(calculateExponentialBackoff(attempt));
        return this.callWhatsAppAPI(message, attempt + 1);
      }
      throw error;
    }
  }

  // ===========================================================================
  // WEBHOOK HANDLING
  // ===========================================================================

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  async processWebhook(payload: WebhookPayload): Promise<void> {
    if (payload.object !== "whatsapp_business_account") {
      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;

        const value = change.value;

        // Process incoming messages
        if (value.messages) {
          for (const msg of value.messages) {
            await this.handleIncomingMessage(msg, value.contacts?.[0]);
          }
        }

        // Process status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await this.handleStatusUpdate(status);
          }
        }
      }
    }
  }

  private async handleIncomingMessage(
    message: WebhookMessage,
    contact?: WebhookContact
  ): Promise<void> {
    this.analytics.totalMessagesReceived++;

    const phoneNumber = message.from;
    const customerName = contact?.profile?.name;

    // Get or create conversation context
    let context = this.conversationContexts.get(phoneNumber);
    if (!context) {
      context = {
        phoneNumber,
        customerName,
        lastMessageAt: new Date(),
        state: "idle",
        data: {}
      };
      this.conversationContexts.set(phoneNumber, context);
    } else {
      context.lastMessageAt = new Date();
      context.customerName = customerName || context.customerName;
    }

    // Handle message based on type
    switch (message.type) {
      case "text":
        await this.handleTextMessage(phoneNumber, message.text?.body || "", context);
        break;
      case "interactive":
        if (message.interactive?.button_reply) {
          await this.handleButtonReply(
            phoneNumber,
            message.interactive.button_reply.id,
            message.interactive.button_reply.title,
            context
          );
        } else if (message.interactive?.list_reply) {
          await this.handleListReply(
            phoneNumber,
            message.interactive.list_reply.id,
            message.interactive.list_reply.title,
            context
          );
        }
        break;
      case "image":
        await this.handleImageMessage(phoneNumber, message.image!, context);
        break;
    }
  }

  private async handleTextMessage(
    phoneNumber: string,
    text: string,
    context: ConversationContext
  ): Promise<void> {
    const lowerText = text.toLowerCase().trim();

    // Main menu commands
    if (lowerText === "menu" || lowerText === "start" || lowerText === "hi" || lowerText === "hello") {
      await this.sendMainMenu(phoneNumber);
      return;
    }

    // Check booking status
    if (lowerText.includes("booking") || lowerText.includes("status")) {
      await this.sendInteractiveButtons(phoneNumber,
        "Would you like to check your booking status?",
        [
          { id: "check_booking", title: "Check Booking" },
          { id: "new_booking", title: "New Booking" },
          { id: "main_menu", title: "Main Menu" }
        ]
      );
      return;
    }

    // Support request
    if (lowerText.includes("help") || lowerText.includes("support")) {
      await this.sendSupportMenu(phoneNumber);
      return;
    }

    // Default response
    await this.sendTextMessage(phoneNumber,
      "Thanks for your message! For quick help, type 'menu' to see available options, or 'support' to connect with our team."
    );
  }

  private async handleButtonReply(
    phoneNumber: string,
    buttonId: string,
    buttonTitle: string,
    context: ConversationContext
  ): Promise<void> {
    switch (buttonId) {
      case "main_menu":
        await this.sendMainMenu(phoneNumber);
        break;
      case "check_booking":
        await this.sendTextMessage(phoneNumber,
          "Please enter your booking ID (you can find this in your confirmation email)."
        );
        context.state = "awaiting_booking_selection";
        break;
      case "new_booking":
        await this.sendTextMessage(phoneNumber,
          "Visit our website to book a session with one of our amazing artists: https://altusink.com/artists"
        );
        break;
      case "support":
        await this.sendSupportMenu(phoneNumber);
        break;
      case "confirm_attendance":
        await this.sendTextMessage(phoneNumber,
          "✅ Great! We've noted your confirmation. See you at your session!"
        );
        break;
      case "reschedule":
        await this.sendTextMessage(phoneNumber,
          "To reschedule your appointment, please contact us at support@altusink.com or call +31 20 123 4567"
        );
        break;
      default:
        await this.sendTextMessage(phoneNumber, "Thanks for your response!");
    }
  }

  private async handleListReply(
    phoneNumber: string,
    itemId: string,
    itemTitle: string,
    context: ConversationContext
  ): Promise<void> {
    // Handle list selections
    await this.sendTextMessage(phoneNumber, `You selected: ${itemTitle}`);
  }

  private async handleImageMessage(
    phoneNumber: string,
    image: { id: string; caption?: string },
    context: ConversationContext
  ): Promise<void> {
    await this.sendTextMessage(phoneNumber,
      "Thanks for sharing! If this is a reference image for a tattoo, please also book a session on our website where you can upload reference images directly."
    );
  }

  private async handleStatusUpdate(status: WebhookStatus): Promise<void> {
    switch (status.status) {
      case "sent":
        break;
      case "delivered":
        this.analytics.totalDelivered++;
        break;
      case "read":
        this.analytics.totalRead++;
        break;
      case "failed":
        this.analytics.totalFailed++;
        console.error("Message delivery failed:", status.errors);
        break;
    }
  }

  // ===========================================================================
  // MENU BUILDERS
  // ===========================================================================

  private async sendMainMenu(phoneNumber: string): Promise<void> {
    await this.sendInteractiveList(
      phoneNumber,
      "Welcome to Altus Ink! 🎨\n\nHow can we help you today?",
      "View Options",
      [
        {
          title: "Bookings",
          rows: [
            { id: "check_booking", title: "Check Booking Status", description: "View your upcoming appointments" },
            { id: "new_booking", title: "Book a Session", description: "Find an artist and book" }
          ]
        },
        {
          title: "Support",
          rows: [
            { id: "support_general", title: "General Help", description: "Questions about our services" },
            { id: "support_payment", title: "Payment Issues", description: "Help with payments & refunds" },
            { id: "support_artist", title: "Artist Contact", description: "Message your artist" }
          ]
        },
        {
          title: "Info",
          rows: [
            { id: "info_artists", title: "Browse Artists", description: "See our talented artists" },
            { id: "info_faq", title: "FAQ", description: "Common questions answered" }
          ]
        }
      ],
      "Altus Ink Support",
      "Reply anytime with 'menu' to see these options"
    );
  }

  private async sendSupportMenu(phoneNumber: string): Promise<void> {
    await this.sendInteractiveButtons(
      phoneNumber,
      "Our support team is here to help! 💬\n\nWhat do you need assistance with?",
      [
        { id: "support_booking", title: "Booking Help" },
        { id: "support_payment", title: "Payment Help" },
        { id: "support_other", title: "Other" }
      ],
      "Support Options",
      "Response time: usually within 1 hour during business hours"
    );
  }

  // ===========================================================================
  // QUEUE MANAGEMENT
  // ===========================================================================

  private queueMessage(message: WhatsAppMessage, priority: "high" | "normal" | "low"): void {
    const item: MessageQueueItem = {
      id: message.id,
      message,
      priority,
      attempts: 0,
      maxAttempts: RETRY_CONFIG.maxAttempts,
      createdAt: new Date()
    };
    this.messageQueue.push(item);
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      if (this.messageQueue.length === 0) return;

      // Sort by priority
      this.messageQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      while (this.messageQueue.length > 0 && this.acquireRateLimitToken()) {
        const item = this.messageQueue.shift()!;

        if (item.scheduledAt && new Date() < item.scheduledAt) {
          this.messageQueue.unshift(item);
          break;
        }

        try {
          const result = await this.callWhatsAppAPI(item.message);
          if (!result.success && item.attempts < item.maxAttempts) {
            item.attempts++;
            this.messageQueue.push(item);
          }
        } catch (error) {
          if (item.attempts < item.maxAttempts) {
            item.attempts++;
            this.messageQueue.push(item);
          }
        }
      }
    }, 100);
  }

  // ===========================================================================
  // RATE LIMITING
  // ===========================================================================

  private acquireRateLimitToken(): boolean {
    this.refreshRateLimitTokens();
    if (this.rateLimitTokens > 0) {
      this.rateLimitTokens--;
      return true;
    }
    return false;
  }

  private refreshRateLimitTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRateLimitRefresh;

    if (elapsed >= 1000) {
      this.rateLimitTokens = Math.min(
        RATE_LIMITS.messagesPerSecond,
        this.rateLimitTokens + Math.floor(elapsed / 1000) * RATE_LIMITS.messagesPerSecond
      );
      this.lastRateLimitRefresh = now;
    }
  }

  private startRateLimitRefresh(): void {
    setInterval(() => this.refreshRateLimitTokens(), 1000);
  }

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  getAnalytics(): WhatsAppAnalytics {
    return { ...this.analytics };
  }

  resetAnalytics(): void {
    this.analytics = {
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalFailed: 0,
      messagesByType: {} as Record<MessageType, number>,
      responseTime: { average: 0, median: 0, p95: 0 },
      conversionRate: 0,
      topTemplates: []
    };
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getActiveConversations(): number {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return Array.from(this.conversationContexts.values())
      .filter(ctx => ctx.lastMessageAt > tenMinutesAgo)
      .length;
  }

  clearConversationContext(phoneNumber: string): void {
    this.conversationContexts.delete(formatPhoneNumber(phoneNumber));
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const whatsappService = new WhatsAppService();
export default whatsappService;
