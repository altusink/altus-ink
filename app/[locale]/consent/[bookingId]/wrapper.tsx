'use client'

import { saveConsentSignature } from '@/app/actions/consent'
import SignaturePad from '@/components/SignaturePad'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ConsentClientWrapper({ bookingId, healthData }: { bookingId: string, healthData: any }) {
    const router = useRouter()

    async function handleSave(base64: string) {
        const metadata = {
            ip: '127.0.0.1', // Should be fetched from headers ideally, simpler here
            userAgent: navigator.userAgent
        }

        const res = await saveConsentSignature(bookingId, base64, healthData, metadata)
        
        if (res.success) {
            toast.success('Documento assinado com sucesso!')
            router.refresh()
        } else {
            toast.error('Erro ao salvar assinatura.')
        }
    }

    return <SignaturePad onSave={handleSave} />
}
