/**
 * ALTUS INK - Environment Configuration
 * Centralized configuration with validation
 */

import { z } from "zod";

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),

    // Session
    SESSION_SECRET: z.string().min(32),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Stripe
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(15),

    // Email
    EMAIL_PROVIDER: z.enum(["sendgrid", "resend"]).default("sendgrid"),
    SENDGRID_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().default("noreply@altusink.com"),
    EMAIL_FROM_NAME: z.string().default("Altus Ink"),

    // Chatwoot
    CHATWOOT_ENABLED: z.coerce.boolean().default(false),
    CHATWOOT_BASE_URL: z.string().url().optional(),
    CHATWOOT_API_TOKEN: z.string().optional(),
    CHATWOOT_ACCOUNT_ID: z.coerce.number().optional(),
    CHATWOOT_INBOX_ID: z.coerce.number().optional(),
    CHATWOOT_WIDGET_TOKEN: z.string().optional(),

    // WhatsApp
    WHATSAPP_ENABLED: z.coerce.boolean().default(false),
    WHATSAPP_PHONE_ID: z.string().optional(),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
    WHATSAPP_VERIFY_TOKEN: z.string().optional(),

    // Storage
    STORAGE_PROVIDER: z.enum(["cloudinary", "s3", "local"]).default("local"),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),

    // Application
    APP_URL: z.string().url().default("http://localhost:5000"),
    API_URL: z.string().url().default("http://localhost:5000"),
    CORS_ORIGINS: z.string().default("http://localhost:5000"),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // Logging
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
    LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),
});

type EnvConfig = z.infer<typeof envSchema>;

function loadConfig(): EnvConfig {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missing = error.issues.map(i => i.path.join(".")).join(", ");
            console.error(`❌ Environment validation failed: ${missing}`);
            console.error("Please check your .env file");
        }
        throw error;
    }
}

export const config = loadConfig();

// Feature flags based on configuration
export const features = {
    stripe: !!config.STRIPE_SECRET_KEY,
    email: !!(config.SENDGRID_API_KEY || config.RESEND_API_KEY),
    chatwoot: config.CHATWOOT_ENABLED && !!config.CHATWOOT_API_TOKEN,
    whatsapp: config.WHATSAPP_ENABLED && !!config.WHATSAPP_ACCESS_TOKEN,
    cloudStorage: config.STORAGE_PROVIDER !== "local",
};

// Stripe configuration
export const stripeConfig = {
    publicKey: config.STRIPE_PUBLIC_KEY,
    secretKey: config.STRIPE_SECRET_KEY,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET,
    platformFeePercent: config.STRIPE_PLATFORM_FEE_PERCENT,
};

// Email configuration
export const emailConfig = {
    provider: config.EMAIL_PROVIDER,
    apiKey: config.EMAIL_PROVIDER === "sendgrid" ? config.SENDGRID_API_KEY : config.RESEND_API_KEY,
    from: config.EMAIL_FROM,
    fromName: config.EMAIL_FROM_NAME,
};

// Chatwoot configuration
export const chatwootConfig = {
    enabled: config.CHATWOOT_ENABLED,
    baseUrl: config.CHATWOOT_BASE_URL,
    apiToken: config.CHATWOOT_API_TOKEN,
    accountId: config.CHATWOOT_ACCOUNT_ID,
    inboxId: config.CHATWOOT_INBOX_ID,
    widgetToken: config.CHATWOOT_WIDGET_TOKEN,
};

// WhatsApp configuration
export const whatsappConfig = {
    enabled: config.WHATSAPP_ENABLED,
    phoneId: config.WHATSAPP_PHONE_ID,
    accessToken: config.WHATSAPP_ACCESS_TOKEN,
    verifyToken: config.WHATSAPP_VERIFY_TOKEN,
};

// Storage configuration
export const storageConfig = {
    provider: config.STORAGE_PROVIDER,
    cloudinary: {
        cloudName: config.CLOUDINARY_CLOUD_NAME,
        apiKey: config.CLOUDINARY_API_KEY,
        apiSecret: config.CLOUDINARY_API_SECRET,
    },
    s3: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        region: config.AWS_REGION,
        bucket: config.AWS_S3_BUCKET,
    },
};

export default config;
