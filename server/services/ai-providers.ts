/**
 * ALTUS INK - MULTI-PROVIDER AI SERVICE
 * Support for 8+ AI providers with unified interface
 * 
 * Supported Providers:
 * - Gemini (Google) - gemini-2.0-flash-exp, gemini-1.5-pro
 * - Claude (Anthropic) - claude-3-haiku, claude-3-sonnet, claude-3-opus
 * - OpenAI - gpt-4o-mini, gpt-4o, o1-mini
 * - Groq - llama-3.3-70b, mixtral-8x7b (ultra fast)
 * - Mistral - mistral-small, mistral-medium, mistral-large
 * - Cohere - command-r, command-r-plus
 * - DeepSeek - deepseek-chat (low cost)
 * - Together AI - various open source models
 */

// =============================================================================
// TYPES
// =============================================================================

export type AIProvider =
    | "gemini"
    | "anthropic"
    | "openai"
    | "groq"
    | "mistral"
    | "cohere"
    | "deepseek"
    | "together";

export interface AIProviderConfig {
    name: string;
    baseUrl: string;
    models: AIModel[];
    defaultModel: string;
    features: string[];
    pricing: string;
    recommended: boolean;
    latency: "low" | "medium" | "high";
}

export interface AIModel {
    id: string;
    name: string;
    contextWindow: number;
    costPer1kTokens: number;
    speed: "fast" | "medium" | "slow";
    capabilities: string[];
}

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIRequestOptions {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stream?: boolean;
}

export interface AIResponse {
    content: string;
    model: string;
    provider: AIProvider;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    latencyMs?: number;
}

// =============================================================================
// PROVIDER CONFIGURATIONS
// =============================================================================

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
    gemini: {
        name: "Google Gemini",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        defaultModel: "gemini-2.0-flash-exp",
        features: ["Multimodal", "Long context", "Fast", "Free tier"],
        pricing: "Free tier available, $0.075/1M tokens",
        recommended: true,
        latency: "low",
        models: [
            { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)", contextWindow: 1048576, costPer1kTokens: 0.000075, speed: "fast", capabilities: ["text", "code", "reasoning"] },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", contextWindow: 1048576, costPer1kTokens: 0.000075, speed: "fast", capabilities: ["text", "code"] },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", contextWindow: 2097152, costPer1kTokens: 0.00125, speed: "medium", capabilities: ["text", "code", "reasoning", "multimodal"] }
        ]
    },

    anthropic: {
        name: "Anthropic Claude",
        baseUrl: "https://api.anthropic.com/v1",
        defaultModel: "claude-3-haiku-20240307",
        features: ["Strong reasoning", "Safe", "Long context", "Coding"],
        pricing: "$0.25-15/1M tokens depending on model",
        recommended: true,
        latency: "medium",
        models: [
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", contextWindow: 200000, costPer1kTokens: 0.00025, speed: "fast", capabilities: ["text", "code"] },
            { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", contextWindow: 200000, costPer1kTokens: 0.003, speed: "medium", capabilities: ["text", "code", "reasoning"] },
            { id: "claude-3-opus-20240229", name: "Claude 3 Opus", contextWindow: 200000, costPer1kTokens: 0.015, speed: "slow", capabilities: ["text", "code", "reasoning", "complex"] }
        ]
    },

    openai: {
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o-mini",
        features: ["Industry standard", "Function calling", "Vision"],
        pricing: "$0.15-60/1M tokens depending on model",
        recommended: true,
        latency: "medium",
        models: [
            { id: "gpt-4o-mini", name: "GPT-4o Mini", contextWindow: 128000, costPer1kTokens: 0.00015, speed: "fast", capabilities: ["text", "code", "vision"] },
            { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, costPer1kTokens: 0.005, speed: "medium", capabilities: ["text", "code", "vision", "reasoning"] },
            { id: "o1-mini", name: "o1 Mini", contextWindow: 128000, costPer1kTokens: 0.003, speed: "slow", capabilities: ["reasoning", "code", "math"] },
            { id: "o1", name: "o1", contextWindow: 200000, costPer1kTokens: 0.015, speed: "slow", capabilities: ["reasoning", "code", "complex"] }
        ]
    },

    groq: {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        defaultModel: "llama-3.3-70b-versatile",
        features: ["Ultra-fast inference", "Open source models", "Free tier"],
        pricing: "Free tier, $0.59/1M tokens for larger models",
        recommended: true,
        latency: "low",
        models: [
            { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextWindow: 131072, costPer1kTokens: 0.00059, speed: "fast", capabilities: ["text", "code", "reasoning"] },
            { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", contextWindow: 131072, costPer1kTokens: 0.00005, speed: "fast", capabilities: ["text", "code"] },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextWindow: 32768, costPer1kTokens: 0.00024, speed: "fast", capabilities: ["text", "code"] },
            { id: "gemma2-9b-it", name: "Gemma 2 9B", contextWindow: 8192, costPer1kTokens: 0.0001, speed: "fast", capabilities: ["text"] }
        ]
    },

    mistral: {
        name: "Mistral AI",
        baseUrl: "https://api.mistral.ai/v1",
        defaultModel: "mistral-small-latest",
        features: ["European provider", "GDPR compliant", "Good coding"],
        pricing: "$0.1-8/1M tokens depending on model",
        recommended: false,
        latency: "medium",
        models: [
            { id: "mistral-small-latest", name: "Mistral Small", contextWindow: 32768, costPer1kTokens: 0.0001, speed: "fast", capabilities: ["text", "code"] },
            { id: "mistral-medium-latest", name: "Mistral Medium", contextWindow: 32768, costPer1kTokens: 0.00027, speed: "medium", capabilities: ["text", "code", "reasoning"] },
            { id: "mistral-large-latest", name: "Mistral Large", contextWindow: 128000, costPer1kTokens: 0.002, speed: "medium", capabilities: ["text", "code", "reasoning"] },
            { id: "codestral-latest", name: "Codestral", contextWindow: 32768, costPer1kTokens: 0.0001, speed: "fast", capabilities: ["code"] }
        ]
    },

    cohere: {
        name: "Cohere",
        baseUrl: "https://api.cohere.ai/v1",
        defaultModel: "command-r",
        features: ["RAG optimized", "Enterprise ready", "Multilingual"],
        pricing: "$0.5-15/1M tokens",
        recommended: false,
        latency: "medium",
        models: [
            { id: "command-r", name: "Command R", contextWindow: 128000, costPer1kTokens: 0.0005, speed: "fast", capabilities: ["text", "rag"] },
            { id: "command-r-plus", name: "Command R+", contextWindow: 128000, costPer1kTokens: 0.003, speed: "medium", capabilities: ["text", "rag", "reasoning"] }
        ]
    },

    deepseek: {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com/v1",
        defaultModel: "deepseek-chat",
        features: ["Ultra low cost", "Strong coding", "Chinese provider"],
        pricing: "$0.14/1M tokens (very cheap)",
        recommended: false,
        latency: "medium",
        models: [
            { id: "deepseek-chat", name: "DeepSeek Chat", contextWindow: 64000, costPer1kTokens: 0.00014, speed: "medium", capabilities: ["text", "code"] },
            { id: "deepseek-coder", name: "DeepSeek Coder", contextWindow: 64000, costPer1kTokens: 0.00014, speed: "medium", capabilities: ["code"] }
        ]
    },

    together: {
        name: "Together AI",
        baseUrl: "https://api.together.xyz/v1",
        defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        features: ["Open source models", "Fast inference", "Many options"],
        pricing: "$0.18-1.20/1M tokens",
        recommended: false,
        latency: "low",
        models: [
            { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", contextWindow: 131072, costPer1kTokens: 0.00088, speed: "fast", capabilities: ["text", "code"] },
            { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B Turbo", contextWindow: 32768, costPer1kTokens: 0.0012, speed: "fast", capabilities: ["text", "code", "reasoning"] },
            { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", contextWindow: 64000, costPer1kTokens: 0.00088, speed: "medium", capabilities: ["text", "code", "reasoning"] }
        ]
    }
};

// =============================================================================
// MULTI-PROVIDER AI CLASS
// =============================================================================

export class MultiProviderAI {
    private currentProvider: AIProvider;
    private currentModel: string;
    private apiKeys: Record<string, string>;

    constructor() {
        this.currentProvider = (process.env.ORACLE_PROVIDER as AIProvider) || "gemini";
        this.currentModel = process.env.ORACLE_MODEL || AI_PROVIDERS[this.currentProvider].defaultModel;

        this.apiKeys = {
            gemini: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || "",
            anthropic: process.env.ANTHROPIC_API_KEY || "",
            openai: process.env.OPENAI_API_KEY || "",
            groq: process.env.GROQ_API_KEY || "",
            mistral: process.env.MISTRAL_API_KEY || "",
            cohere: process.env.COHERE_API_KEY || "",
            deepseek: process.env.DEEPSEEK_API_KEY || "",
            together: process.env.TOGETHER_API_KEY || ""
        };
    }

    /**
     * Get available providers (with API keys configured)
     */
    getAvailableProviders(): AIProvider[] {
        return Object.entries(this.apiKeys)
            .filter(([_, key]) => !!key)
            .map(([provider]) => provider as AIProvider);
    }

    /**
     * Get all provider configurations
     */
    getAllProviders(): Record<AIProvider, AIProviderConfig> {
        return AI_PROVIDERS;
    }

    /**
     * Set active provider
     */
    setProvider(provider: AIProvider, model?: string): void {
        if (!AI_PROVIDERS[provider]) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        if (!this.apiKeys[provider]) {
            throw new Error(`No API key configured for ${provider}`);
        }

        this.currentProvider = provider;
        this.currentModel = model || AI_PROVIDERS[provider].defaultModel;
    }

    /**
     * Get current provider info
     */
    getCurrentProvider(): { provider: AIProvider; model: string; config: AIProviderConfig } {
        return {
            provider: this.currentProvider,
            model: this.currentModel,
            config: AI_PROVIDERS[this.currentProvider]
        };
    }

    /**
     * Send chat completion request
     */
    async chat(
        messages: AIMessage[],
        options: AIRequestOptions = {}
    ): Promise<AIResponse> {
        const startTime = Date.now();
        const provider = this.currentProvider;
        const apiKey = this.apiKeys[provider];

        if (!apiKey) {
            throw new Error(`No API key for provider: ${provider}`);
        }

        let content: string;
        let usage: AIResponse["usage"];

        switch (provider) {
            case "gemini":
                ({ content, usage } = await this.callGemini(messages, options, apiKey));
                break;
            case "anthropic":
                ({ content, usage } = await this.callClaude(messages, options, apiKey));
                break;
            case "openai":
            case "groq":
            case "mistral":
            case "together":
            case "deepseek":
                ({ content, usage } = await this.callOpenAICompatible(messages, options, apiKey, provider));
                break;
            case "cohere":
                ({ content, usage } = await this.callCohere(messages, options, apiKey));
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        return {
            content,
            model: this.currentModel,
            provider,
            usage,
            latencyMs: Date.now() - startTime
        };
    }

    /**
     * Gemini API call
     */
    private async callGemini(
        messages: AIMessage[],
        options: AIRequestOptions,
        apiKey: string
    ): Promise<{ content: string; usage?: AIResponse["usage"] }> {
        const config = AI_PROVIDERS.gemini;

        // Convert messages to Gemini format
        const systemMessage = messages.find(m => m.role === "system")?.content || "";
        const chatMessages = messages.filter(m => m.role !== "system");

        const contents = chatMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
        }));

        const response = await fetch(
            `${config.baseUrl}/models/${this.currentModel}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemMessage ? { parts: [{ text: systemMessage }] } : undefined,
                    generationConfig: {
                        maxOutputTokens: options.maxTokens || 2048,
                        temperature: options.temperature ?? 0.7,
                        topP: options.topP
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return {
            content,
            usage: data.usageMetadata ? {
                promptTokens: data.usageMetadata.promptTokenCount,
                completionTokens: data.usageMetadata.candidatesTokenCount,
                totalTokens: data.usageMetadata.totalTokenCount
            } : undefined
        };
    }

    /**
     * Anthropic Claude API call
     */
    private async callClaude(
        messages: AIMessage[],
        options: AIRequestOptions,
        apiKey: string
    ): Promise<{ content: string; usage?: AIResponse["usage"] }> {
        const config = AI_PROVIDERS.anthropic;

        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");

        const response = await fetch(`${config.baseUrl}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: this.currentModel,
                max_tokens: options.maxTokens || 2048,
                temperature: options.temperature,
                system: systemMessage,
                messages: chatMessages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();

        return {
            content: data.content?.[0]?.text || "",
            usage: data.usage ? {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            } : undefined
        };
    }

    /**
     * OpenAI-compatible API call (OpenAI, Groq, Mistral, Together, DeepSeek)
     */
    private async callOpenAICompatible(
        messages: AIMessage[],
        options: AIRequestOptions,
        apiKey: string,
        provider: AIProvider
    ): Promise<{ content: string; usage?: AIResponse["usage"] }> {
        const config = AI_PROVIDERS[provider];

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.currentModel,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                max_tokens: options.maxTokens || 2048,
                temperature: options.temperature ?? 0.7,
                top_p: options.topP
            })
        });

        if (!response.ok) {
            throw new Error(`${provider} API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();

        return {
            content: data.choices?.[0]?.message?.content || "",
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            } : undefined
        };
    }

    /**
     * Cohere API call
     */
    private async callCohere(
        messages: AIMessage[],
        options: AIRequestOptions,
        apiKey: string
    ): Promise<{ content: string; usage?: AIResponse["usage"] }> {
        const config = AI_PROVIDERS.cohere;

        const systemMessage = messages.find(m => m.role === "system")?.content;
        const chatMessages = messages.filter(m => m.role !== "system");
        const lastMessage = chatMessages.pop();

        const response = await fetch(`${config.baseUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.currentModel,
                message: lastMessage?.content || "",
                preamble: systemMessage,
                chat_history: chatMessages.map(m => ({
                    role: m.role === "assistant" ? "CHATBOT" : "USER",
                    message: m.content
                })),
                max_tokens: options.maxTokens || 2048,
                temperature: options.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();

        return {
            content: data.text || "",
            usage: data.meta?.tokens ? {
                promptTokens: data.meta.tokens.input_tokens,
                completionTokens: data.meta.tokens.output_tokens,
                totalTokens: data.meta.tokens.input_tokens + data.meta.tokens.output_tokens
            } : undefined
        };
    }

    /**
     * Test all configured providers
     */
    async testAllProviders(): Promise<Record<AIProvider, { success: boolean; latencyMs?: number; error?: string }>> {
        const results: Record<string, { success: boolean; latencyMs?: number; error?: string }> = {};
        const testMessage = [{ role: "user" as const, content: "Say 'OK' if you can hear me." }];

        for (const provider of Object.keys(AI_PROVIDERS) as AIProvider[]) {
            if (!this.apiKeys[provider]) {
                results[provider] = { success: false, error: "No API key" };
                continue;
            }

            try {
                const originalProvider = this.currentProvider;
                const originalModel = this.currentModel;

                this.setProvider(provider);
                const response = await this.chat(testMessage, { maxTokens: 10 });

                this.currentProvider = originalProvider;
                this.currentModel = originalModel;

                results[provider] = { success: true, latencyMs: response.latencyMs };
            } catch (error: any) {
                results[provider] = { success: false, error: error.message };
            }
        }

        return results as Record<AIProvider, { success: boolean; latencyMs?: number; error?: string }>;
    }

    /**
     * Get recommendations based on use case
     */
    getRecommendation(useCase: "monitoring" | "support" | "analysis" | "coding"): {
        provider: AIProvider;
        model: string;
        reason: string;
    } {
        const recommendations = {
            monitoring: {
                provider: "gemini" as AIProvider,
                model: "gemini-2.0-flash-exp",
                reason: "Lowest latency, free tier, good for frequent health checks"
            },
            support: {
                provider: "anthropic" as AIProvider,
                model: "claude-3-haiku-20240307",
                reason: "Best reasoning at low cost, safe responses"
            },
            analysis: {
                provider: "anthropic" as AIProvider,
                model: "claude-3-5-sonnet-20241022",
                reason: "Excellent at complex analysis and pattern recognition"
            },
            coding: {
                provider: "openai" as AIProvider,
                model: "gpt-4o",
                reason: "Industry standard for code generation and debugging"
            }
        };

        return recommendations[useCase];
    }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const multiProviderAI = new MultiProviderAI();

export default multiProviderAI;
