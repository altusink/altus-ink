import { GoogleGenerativeAI } from '@google/generative-ai'
import { adminOS } from '@/lib/services/admin-os'

export async function getGeminiModel() {
    let apiKey = process.env.GOOGLE_AI_API_KEY;

    // Try DB Override
    try {
        const integrations = await adminOS.getIntegrations();
        const gemini = integrations.find(i => i.service_id === 'gemini' && i.is_active);
        
        if (gemini?.config && typeof gemini.config === 'object' && 'apiKey' in gemini.config) {
            // @ts-ignore
            apiKey = gemini.config.apiKey;
        }
    } catch (e) {
        console.warn('Gemini Key Fetch Failed:', e);
    }

    if (!apiKey) {
        throw new Error('Gemini API Key missing (DB or Env).');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using 'gemini-pro' (or 'gemini-1.5-pro' if available to user) calling it 'gemini-pro' for safety
    return genAI.getGenerativeModel({ model: "gemini-pro" });
}
