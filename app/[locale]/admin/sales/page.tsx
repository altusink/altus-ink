'use client'

import { useState } from 'react'
import SalesPipeline from '@/components/admin/crm/SalesPipeline'
import ChatInterface from '@/components/admin/crm/ChatInterface'
import { LayoutDashboard, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SalesPage() {
    const [activeTab, setActiveTab] = useState<'pipeline' | 'chat'>('chat') // Default to chat to show off

    return (
        <div className="h-screen flex flex-col bg-bg-dark">
            {/* Tab Navigation */}
            <div className="flex items-center gap-6 px-8 py-4 border-b border-white/5 bg-black/20">
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'pipeline'
                        ? 'text-neon-green border-neon-green'
                        : 'text-text-muted border-transparent hover:text-white'
                        }`}
                >
                    <LayoutDashboard size={18} />
                    Pipeline
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'chat'
                        ? 'text-neon-green border-neon-green'
                        : 'text-text-muted border-transparent hover:text-white'
                        }`}
                >
                    <MessageSquare size={18} />
                    WhatsApp
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'pipeline' ? <SalesPipeline /> : <ChatInterface />}
            </div>
        </div>
    )
}
