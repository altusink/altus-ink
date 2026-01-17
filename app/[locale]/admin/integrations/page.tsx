import IntegrationsList from '@/components/admin/IntegrationsList'

export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold text-white font-heading">Integrações & API</h1>
                    <p className="text-text-muted">Gerencie conexões externas e inteligência artificial.</p>
                </div>
            </div>

            <IntegrationsList />
        </div>
    )
}
