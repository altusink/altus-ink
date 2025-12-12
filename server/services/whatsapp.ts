// WhatsApp notification service via Z-API
// Documentation: https://developer.z-api.io/

interface WhatsAppConfig {
  instanceId: string;
  token: string;
}

interface SendMessageParams {
  phone: string;
  message: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private baseUrl = 'https://api.z-api.io';

  initialize(config: WhatsAppConfig) {
    this.config = config;
    console.log('[whatsapp] Z-API service initialized');
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.instanceId && !!this.config.token;
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned;
    }
    if (cleaned.length === 11 || cleaned.length === 10) {
      return `55${cleaned}`;
    }
    return cleaned;
  }

  async sendMessage(params: SendMessageParams): Promise<{ success: boolean; error?: string }> {
    if (!this.config) {
      console.log('[whatsapp] Cannot send - service not configured');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    const formattedPhone = this.formatPhone(params.phone);
    const url = `${this.baseUrl}/instances/${this.config.instanceId}/token/${this.config.token}/send-text`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: params.message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[whatsapp] API error:', errorText);
        return { success: false, error: `API error: ${response.status}` };
      }

      const result = await response.json();
      console.log(`[whatsapp] Message sent to ${formattedPhone}`);
      return { success: true };
    } catch (error: any) {
      console.error('[whatsapp] Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBookingConfirmation(params: {
    customerPhone: string;
    customerName: string;
    artistName: string;
    date: string;
    time: string;
    depositAmount: string;
    currency: string;
  }): Promise<{ success: boolean; error?: string }> {
    const message = `*ALTUSINK.IO - Agendamento Confirmado*

Ola ${params.customerName}!

Seu agendamento com *${params.artistName}* foi confirmado.

*Data:* ${params.date}
*Horario:* ${params.time}
*Sinal pago:* ${params.currency} ${params.depositAmount}

Chegue 10 minutos antes do horario agendado.

Em caso de duvidas, entre em contato com o artista.

---
ALTUSINK.IO - Premium Tattoo Booking`;

    return this.sendMessage({
      phone: params.customerPhone,
      message,
    });
  }

  async sendArtistNotification(params: {
    artistPhone: string;
    customerName: string;
    date: string;
    time: string;
    depositAmount: string;
    currency: string;
  }): Promise<{ success: boolean; error?: string }> {
    const message = `*ALTUSINK.IO - Novo Agendamento*

Voce tem um novo cliente!

*Cliente:* ${params.customerName}
*Data:* ${params.date}
*Horario:* ${params.time}
*Sinal recebido:* ${params.currency} ${params.depositAmount}

Acesse seu painel para mais detalhes.

---
ALTUSINK.IO`;

    return this.sendMessage({
      phone: params.artistPhone,
      message,
    });
  }
}

export const whatsappService = new WhatsAppService();
