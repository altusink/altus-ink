export type AdminSetting = {
    key: string;
    value: Record<string, any>;
    category: 'ui' | 'business' | 'email' | 'general';
    description?: string;
    updated_at: string;
    updated_by?: string;
}

export type IntegrationConfig = {
    apiKey?: string;
    webhookSecret?: string;
    customDomain?: string;
    [key: string]: any;
}

export type IntegrationService = {
    service_id: 'stripe' | 'resend' | 'gemini' | 'chatwoot';
    name: string;
    config: IntegrationConfig;
    is_active: boolean;
    status: 'connected' | 'disconnected' | 'error' | 'syncing';
    last_sync?: string;
    metadata?: Record<string, any>;
}

export type AIAuditLog = {
    id: string;
    action: string;
    details: Record<string, any>;
    status: 'success' | 'failed';
    performed_at: string;
    triggered_by?: string;
}

// Visual Builder Types
export type ThemeConfig = {
    primaryColor: string;
    secondaryColor: string;
    glassOpacity: number;
    borderRadius: string;
    fontHeading: string;
    enableScanlines: boolean;
    enableAurora: boolean;
}
