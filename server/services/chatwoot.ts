/**
 * ALTUS INK - CHATWOOT INTEGRATION SERVICE
 * Live chat and customer support integration
 * 
 * Features:
 * - Widget script injection
 * - Contact creation/sync
 * - Conversation management
 * - Custom attributes
 * - Team inbox routing
 * - Automated responses
 * - Webhook handling
 * - Canned responses
 * - Conversation labels
 * - Customer identification
 */

import { config, chatwootConfig, features } from "../config";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ChatwootContact {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    identifier?: string;
    custom_attributes?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface ChatwootConversation {
    id: number;
    account_id: number;
    inbox_id: number;
    status: "open" | "resolved" | "pending" | "snoozed";
    priority: "low" | "medium" | "high" | "urgent" | null;
    contact: ChatwootContact;
    messages: ChatwootMessage[];
    labels: string[];
    custom_attributes: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface ChatwootMessage {
    id: number;
    content: string;
    message_type: "incoming" | "outgoing" | "activity" | "template";
    content_type: "text" | "input_text" | "input_email" | "input_select" | "cards" | "form";
    private: boolean;
    sender?: {
        id: number;
        name: string;
        email: string;
        type: "contact" | "user";
    };
    created_at: string;
}

export interface CreateContactParams {
    name: string;
    email: string;
    phone?: string;
    identifier?: string;
    customAttributes?: {
        role?: "customer" | "artist";
        artistId?: string;
        bookingId?: string;
        locale?: string;
        lastBookingDate?: string;
        totalBookings?: number;
        totalSpent?: number;
        preferredArtist?: string;
        [key: string]: any;
    };
}

export interface SendMessageParams {
    conversationId: number;
    message: string;
    isPrivate?: boolean;
    contentType?: "text" | "input_text" | "input_email";
    contentAttributes?: Record<string, any>;
}

export interface CreateConversationParams {
    contactId: number;
    inboxId?: number;
    subject?: string;
    initialMessage?: string;
    labels?: string[];
    customAttributes?: Record<string, any>;
    assignToTeam?: number;
    assignToAgent?: number;
}

export interface WebhookPayload {
    event: string;
    account: { id: number };
    conversation?: ChatwootConversation;
    message?: ChatwootMessage;
    contact?: ChatwootContact;
}

// =============================================================================
// CLIENT CLASS
// =============================================================================

class ChatwootService {
    private baseUrl: string;
    private apiToken: string;
    private accountId: number;
    private inboxId: number;
    private enabled: boolean;

    constructor() {
        this.baseUrl = chatwootConfig.baseUrl || "https://app.chatwoot.com";
        this.apiToken = chatwootConfig.apiToken || "";
        this.accountId = chatwootConfig.accountId || 0;
        this.inboxId = chatwootConfig.inboxId || 0;
        this.enabled = features.chatwoot;
    }

    /**
     * Check if Chatwoot is properly configured
     */
    isConfigured(): boolean {
        return this.enabled && !!this.apiToken && !!this.accountId;
    }

    /**
     * Make authenticated API request
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        if (!this.isConfigured()) {
            throw new Error("Chatwoot is not configured");
        }

        const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "api_access_token": this.apiToken,
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Chatwoot API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    // ===========================================================================
    // CONTACTS
    // ===========================================================================

    /**
     * Create a new contact
     */
    async createContact(params: CreateContactParams): Promise<ChatwootContact> {
        const payload = {
            name: params.name,
            email: params.email,
            phone_number: params.phone,
            identifier: params.identifier || params.email,
            custom_attributes: params.customAttributes
        };

        return this.request<{ payload: { contact: ChatwootContact } }>(
            "/contacts",
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        ).then(res => res.payload.contact);
    }

    /**
     * Search for a contact by email
     */
    async findContactByEmail(email: string): Promise<ChatwootContact | null> {
        const result = await this.request<{ payload: ChatwootContact[] }>(
            `/contacts/search?q=${encodeURIComponent(email)}`
        );

        return result.payload.find(c => c.email === email) || null;
    }

    /**
     * Get or create contact
     */
    async getOrCreateContact(params: CreateContactParams): Promise<ChatwootContact> {
        const existing = await this.findContactByEmail(params.email);
        if (existing) {
            // Update custom attributes if provided
            if (params.customAttributes) {
                return this.updateContact(existing.id, { customAttributes: params.customAttributes });
            }
            return existing;
        }

        return this.createContact(params);
    }

    /**
     * Update contact details
     */
    async updateContact(
        contactId: number,
        updates: Partial<CreateContactParams>
    ): Promise<ChatwootContact> {
        const payload: Record<string, any> = {};
        if (updates.name) payload.name = updates.name;
        if (updates.email) payload.email = updates.email;
        if (updates.phone) payload.phone_number = updates.phone;
        if (updates.customAttributes) payload.custom_attributes = updates.customAttributes;

        return this.request<ChatwootContact>(
            `/contacts/${contactId}`,
            {
                method: "PATCH",
                body: JSON.stringify(payload)
            }
        );
    }

    /**
     * Get contact by ID
     */
    async getContact(contactId: number): Promise<ChatwootContact> {
        return this.request<ChatwootContact>(`/contacts/${contactId}`);
    }

    /**
     * Merge duplicate contacts
     */
    async mergeContacts(baseContactId: number, mergeContactId: number): Promise<void> {
        await this.request(
            `/contacts/${baseContactId}/merge`,
            {
                method: "POST",
                body: JSON.stringify({ merge_contact_id: mergeContactId })
            }
        );
    }

    // ===========================================================================
    // CONVERSATIONS
    // ===========================================================================

    /**
     * Create a new conversation
     */
    async createConversation(params: CreateConversationParams): Promise<ChatwootConversation> {
        const payload = {
            source_id: `altusink_${Date.now()}`,
            inbox_id: params.inboxId || this.inboxId,
            contact_id: params.contactId,
            custom_attributes: params.customAttributes,
            additional_attributes: params.subject ? { subject: params.subject } : undefined
        };

        const conversation = await this.request<ChatwootConversation>(
            "/conversations",
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        // Add initial message if provided
        if (params.initialMessage) {
            await this.sendMessage({
                conversationId: conversation.id,
                message: params.initialMessage
            });
        }

        // Add labels if provided
        if (params.labels && params.labels.length > 0) {
            await this.addLabels(conversation.id, params.labels);
        }

        // Assign to team/agent if provided
        if (params.assignToTeam) {
            await this.assignToTeam(conversation.id, params.assignToTeam);
        } else if (params.assignToAgent) {
            await this.assignToAgent(conversation.id, params.assignToAgent);
        }

        return conversation;
    }

    /**
     * Get conversation by ID
     */
    async getConversation(conversationId: number): Promise<ChatwootConversation> {
        return this.request<ChatwootConversation>(`/conversations/${conversationId}`);
    }

    /**
     * List conversations for a contact
     */
    async getContactConversations(contactId: number): Promise<ChatwootConversation[]> {
        const result = await this.request<{ payload: ChatwootConversation[] }>(
            `/contacts/${contactId}/conversations`
        );
        return result.payload;
    }

    /**
     * Update conversation status
     */
    async updateConversationStatus(
        conversationId: number,
        status: "open" | "resolved" | "pending" | "snoozed"
    ): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/toggle_status`,
            {
                method: "POST",
                body: JSON.stringify({ status })
            }
        );
    }

    /**
     * Resolve a conversation
     */
    async resolveConversation(conversationId: number): Promise<void> {
        await this.updateConversationStatus(conversationId, "resolved");
    }

    /**
     * Reopen a conversation
     */
    async reopenConversation(conversationId: number): Promise<void> {
        await this.updateConversationStatus(conversationId, "open");
    }

    /**
     * Set conversation priority
     */
    async setConversationPriority(
        conversationId: number,
        priority: "low" | "medium" | "high" | "urgent" | null
    ): Promise<void> {
        await this.request(
            `/conversations/${conversationId}`,
            {
                method: "PATCH",
                body: JSON.stringify({ priority })
            }
        );
    }

    // ===========================================================================
    // MESSAGES
    // ===========================================================================

    /**
     * Send a message in a conversation
     */
    async sendMessage(params: SendMessageParams): Promise<ChatwootMessage> {
        const payload = {
            content: params.message,
            message_type: "outgoing",
            private: params.isPrivate || false,
            content_type: params.contentType || "text",
            content_attributes: params.contentAttributes
        };

        return this.request<ChatwootMessage>(
            `/conversations/${params.conversationId}/messages`,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );
    }

    /**
     * Send private note (internal team message)
     */
    async sendPrivateNote(conversationId: number, note: string): Promise<ChatwootMessage> {
        return this.sendMessage({
            conversationId,
            message: note,
            isPrivate: true
        });
    }

    /**
     * Send template message
     */
    async sendTemplateMessage(
        conversationId: number,
        templateName: string,
        variables: Record<string, string>
    ): Promise<ChatwootMessage> {
        // Build message from template (would use actual canned responses in production)
        const templates: Record<string, string> = {
            welcome: `Hi {{name}}! Welcome to Altus Ink. How can we help you today?`,
            booking_help: `I'd be happy to help you with your booking, {{name}}. What would you like to know?`,
            artist_info: `You can browse all our artists at ${config.APP_URL}/artists. Each artist has their own portfolio and booking page.`,
            cancellation: `To cancel or reschedule your booking, please visit ${config.APP_URL}/my-bookings or reply here with your booking ID.`,
            payment_issue: `I'm sorry to hear you're having payment issues. Let me look into this for you. Could you provide your booking ID?`
        };

        let message = templates[templateName] || templateName;

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            message = message.replace(new RegExp(`{{${key}}}`, "g"), value);
        }

        return this.sendMessage({ conversationId, message });
    }

    /**
     * Get conversation messages
     */
    async getMessages(conversationId: number, before?: number): Promise<ChatwootMessage[]> {
        const url = before
            ? `/conversations/${conversationId}/messages?before=${before}`
            : `/conversations/${conversationId}/messages`;

        const result = await this.request<{ payload: ChatwootMessage[] }>(url);
        return result.payload;
    }

    // ===========================================================================
    // LABELS & ATTRIBUTES
    // ===========================================================================

    /**
     * Add labels to conversation
     */
    async addLabels(conversationId: number, labels: string[]): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/labels`,
            {
                method: "POST",
                body: JSON.stringify({ labels })
            }
        );
    }

    /**
     * Remove label from conversation
     */
    async removeLabel(conversationId: number, labelToRemove: string): Promise<void> {
        const conversation = await this.getConversation(conversationId);
        const updatedLabels = conversation.labels.filter(l => l !== labelToRemove);

        await this.request(
            `/conversations/${conversationId}/labels`,
            {
                method: "POST",
                body: JSON.stringify({ labels: updatedLabels })
            }
        );
    }

    /**
     * Update conversation custom attributes
     */
    async updateConversationAttributes(
        conversationId: number,
        attributes: Record<string, any>
    ): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/custom_attributes`,
            {
                method: "POST",
                body: JSON.stringify({ custom_attributes: attributes })
            }
        );
    }

    // ===========================================================================
    // ASSIGNMENT
    // ===========================================================================

    /**
     * Assign conversation to an agent
     */
    async assignToAgent(conversationId: number, agentId: number): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/assignments`,
            {
                method: "POST",
                body: JSON.stringify({ assignee_id: agentId })
            }
        );
    }

    /**
     * Assign conversation to a team
     */
    async assignToTeam(conversationId: number, teamId: number): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/assignments`,
            {
                method: "POST",
                body: JSON.stringify({ team_id: teamId })
            }
        );
    }

    /**
     * Unassign conversation
     */
    async unassignConversation(conversationId: number): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/assignments`,
            {
                method: "POST",
                body: JSON.stringify({ assignee_id: null })
            }
        );
    }

    // ===========================================================================
    // WIDGET HELPERS
    // ===========================================================================

    /**
     * Get widget script for embedding
     */
    getWidgetScript(): string {
        if (!this.isConfigured() || !chatwootConfig.widgetToken) {
            return "";
        }

        return `
      <script>
        (function(d,t) {
          var BASE_URL = "${this.baseUrl}";
          var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
          g.src = BASE_URL + "/packs/js/sdk.js";
          g.defer = true;
          g.async = true;
          s.parentNode.insertBefore(g, s);
          g.onload = function() {
            window.chatwootSDK.run({
              websiteToken: "${chatwootConfig.widgetToken}",
              baseUrl: BASE_URL
            });
          };
        })(document, "script");
      </script>
    `;
    }

    /**
     * Get widget settings for client-side
     */
    getWidgetSettings(): {
        enabled: boolean;
        token?: string;
        baseUrl?: string;
    } {
        if (!this.isConfigured()) {
            return { enabled: false };
        }

        return {
            enabled: true,
            token: chatwootConfig.widgetToken,
            baseUrl: this.baseUrl
        };
    }

    /**
     * Generate user identification token (for authenticated users)
     */
    generateIdentificationToken(userId: string, email: string): string {
        // In production, this would use HMAC to generate a secure token
        // For now, return a placeholder
        const crypto = require("crypto");
        const secretKey = this.apiToken;
        const identifier = email;

        return crypto
            .createHmac("sha256", secretKey)
            .update(identifier)
            .digest("hex");
    }

    // ===========================================================================
    // WEBHOOK HANDLING
    // ===========================================================================

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        // Chatwoot webhook signature verification
        const crypto = require("crypto");
        const expectedSignature = crypto
            .createHmac("sha256", this.apiToken)
            .update(payload)
            .digest("hex");

        return signature === expectedSignature;
    }

    /**
     * Handle incoming webhook
     */
    async handleWebhook(payload: WebhookPayload): Promise<{
        handled: boolean;
        action?: string;
    }> {
        const { event, conversation, message, contact } = payload;

        try {
            switch (event) {
                case "conversation_created":
                    console.log(`New conversation: ${conversation?.id}`);
                    // Could auto-label based on source, send welcome message, etc.
                    if (conversation) {
                        await this.addLabels(conversation.id, ["new", "unread"]);
                    }
                    return { handled: true, action: "conversation_created" };

                case "conversation_status_changed":
                    console.log(`Conversation ${conversation?.id} status: ${conversation?.status}`);
                    return { handled: true, action: "status_changed" };

                case "message_created":
                    console.log(`New message in conversation ${message?.id}`);
                    // Could trigger auto-responses based on content
                    if (message?.content?.toLowerCase().includes("book")) {
                        // User asking about booking
                        return { handled: true, action: "booking_intent_detected" };
                    }
                    return { handled: true, action: "message_received" };

                case "conversation_resolved":
                    console.log(`Conversation ${conversation?.id} resolved`);
                    // Could send satisfaction survey, update metrics, etc.
                    return { handled: true, action: "resolved" };

                default:
                    return { handled: false };
            }
        } catch (error) {
            console.error("Error handling Chatwoot webhook:", error);
            return { handled: false };
        }
    }

    // ===========================================================================
    // BOOKING INTEGRATION
    // ===========================================================================

    /**
     * Create contact and conversation for new booking
     */
    async createBookingConversation(params: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        bookingId: string;
        artistName: string;
        bookingDate: Date;
    }): Promise<{ contactId: number; conversationId: number }> {
        // Get or create contact
        const contact = await this.getOrCreateContact({
            name: params.customerName,
            email: params.customerEmail,
            phone: params.customerPhone,
            customAttributes: {
                role: "customer",
                bookingId: params.bookingId,
                lastBookingDate: params.bookingDate.toISOString()
            }
        });

        // Create conversation
        const conversation = await this.createConversation({
            contactId: contact.id,
            subject: `Booking ${params.bookingId} - ${params.artistName}`,
            initialMessage: `New booking created!\n\nBooking ID: ${params.bookingId}\nArtist: ${params.artistName}\nDate: ${params.bookingDate.toLocaleDateString()}\n\nWe'll send you a reminder before your session. Feel free to reach out if you have any questions!`,
            labels: ["booking", "automated"],
            customAttributes: {
                booking_id: params.bookingId,
                artist: params.artistName,
                booking_date: params.bookingDate.toISOString()
            }
        });

        return {
            contactId: contact.id,
            conversationId: conversation.id
        };
    }

    /**
     * Send booking notification in existing conversation
     */
    async notifyBookingUpdate(
        conversationId: number,
        updateType: "confirmed" | "cancelled" | "rescheduled" | "reminder",
        details: string
    ): Promise<void> {
        const messages: Record<string, string> = {
            confirmed: `✅ Your booking has been confirmed!\n\n${details}`,
            cancelled: `❌ Your booking has been cancelled.\n\n${details}`,
            rescheduled: `📅 Your booking has been rescheduled.\n\n${details}`,
            reminder: `⏰ Reminder: Your session is coming up!\n\n${details}`
        };

        await this.sendMessage({
            conversationId,
            message: messages[updateType] || details
        });
    }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const chatwootService = new ChatwootService();

export default chatwootService;
