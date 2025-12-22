import { createClient } from '@/lib/supabase/client'
import { AdminSetting, IntegrationService, ThemeConfig } from '@/lib/types/admin'

const DEFAULT_THEME: ThemeConfig = {
    primaryColor: '#00ff9d',
    secondaryColor: '#00f0ff',
    glassOpacity: 0.6,
    borderRadius: '16px',
    fontHeading: 'Orbitron',
    enableScanlines: true,
    enableAurora: true
}

export class AdminOS {
    private supabase = createClient()

    // --- Settings / Theme ---
    async getSettings(key: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('admin_settings')
            .select('value')
            .eq('key', key)
            .single()
        
        if (error) {
            console.warn(`AdminOS: Key ${key} not found, using default.`)
            return null
        }
        return data.value
    }

    async getTheme(): Promise<ThemeConfig> {
        const settings = await this.getSettings('theme_config')
        return { ...DEFAULT_THEME, ...settings }
    }

    async updateSetting(key: string, value: any, category = 'general') {
        const { error } = await this.supabase
            .from('admin_settings')
            .upsert({ key, value, category, updated_at: new Date().toISOString() })
        
        if (error) throw error
    }

    // --- Integrations ---
    async getIntegrations(): Promise<IntegrationService[]> {
        const { data, error } = await this.supabase
            .from('integrations')
            .select('*')
            .order('name')
        
        if (error) throw error
        return data as IntegrationService[]
    }

    async toggleIntegration(serviceId: string, isActive: boolean) {
        const { error } = await this.supabase
            .from('integrations')
            .update({ is_active: isActive })
            .eq('service_id', serviceId)
        
        if (error) throw error
    }

    async updateIntegrationConfig(serviceId: string, config: any) {
        // In a real app, encrypt 'config' here before sending
        // UPSERT is safer: creates row if missing
        const { error } = await this.supabase
            .from('integrations')
            .upsert({ 
                service_id: serviceId, 
                config, 
                status: 'connected', 
                last_sync: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'service_id' })
            .select() // Ensure we get a response
        
        if (error) {
            console.error("AdminOS Config Update Error:", error)
            throw error
        }
    }

    // --- AI Audit ---
    async logAIAction(action: string, details: any) {
        await this.supabase.from('ai_audit_logs').insert({
            action,
            details,
            status: 'success'
        })
    }
}

export const adminOS = new AdminOS()
