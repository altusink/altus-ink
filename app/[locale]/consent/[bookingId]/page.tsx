import { getBookingForConsent, saveConsentSignature } from '@/app/actions/consent'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import SignaturePad from '@/components/SignaturePad'
import PrivacyPolicyText from '@/app/[locale]/politica-privacidade/page' // Reuse or just copy functionality
import { CheckCircle, Shield, Info } from 'lucide-react'
import ConsentClientWrapper from './wrapper' // Client component for interaction

export default async function ConsentPage({ params }: { params: { bookingId: string } }) {
    const data = await getBookingForConsent(params.bookingId)
    
    if (!data || !data.booking) {
        notFound()
    }

    const  { booking, isSigned, signedAt } = data

    return (
        <div className="min-h-screen bg-studio-black text-white p-6 md:p-12 flex items-center justify-center">
            <div className="max-w-xl w-full space-y-8">
                
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-heading text-white mb-2">Termo de Consentimento</h1>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-muted">
                        Booking ID: <span className="font-mono text-neon-green">{booking.id.split('-')[0]}</span>
                    </div>
                </div>

                {/* Status: Signed */}
                {isSigned ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-fade-in">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-green-400 mb-2">Documento Assinado</h2>
                        <p className="text-text-muted text-sm">
                            Realizado em {new Date(signedAt).toLocaleString('pt-BR')}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 animate-fade-in relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

                        <div className="space-y-6 relative z-10">
                            {/* Client Summary */}
                            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/10">
                                <div>
                                    <p className="text-xs text-text-muted uppercase mb-1">Cliente</p>
                                    <p className="font-bold">{booking.client_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted uppercase mb-1">Data</p>
                                    <p className="font-bold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Medical Snapshot */}
                            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                    <Info size={14} className="text-neon-green" />
                                    Declaração de Saúde
                                </h3>
                                <ul className="space-y-2 text-xs text-text-muted">
                                    <li>• Declaro ser maior de 18 anos.</li>
                                    <li>• Declaro não estar sob efeito de álcool ou drogas.</li>
                                    <li>• Reconheço que tatuagem é um procedimento irreversível.</li>
                                    {booking.health_form?.allergies && (
                                        <li className="text-yellow-200/80">• Alergias: {booking.health_form.allergies}</li>
                                    )}
                                </ul>
                            </div>

                            {/* Terms Scroll */}
                            <div className="h-40 overflow-y-auto bg-black/40 rounded-lg p-3 text-[10px] text-text-muted border border-white/5 leading-relaxed">
                                <p className="mb-2"><strong>TERMO DE RESPONSABILIDADE</strong></p>
                                <p className="mb-2">1. Autorizo a realização do procedimento de tatuagem descrito neste agendamento.</p>
                                <p className="mb-2">2. Entendo os cuidados pós-procedimento (Aftercare) e me comprometo a segui-los rigorosamente.</p>
                                <p>3. Isento o estúdio e o artista de responsabilidade por reações alérgicas não informadas ou má cicatrização por falta de cuidado.</p>
                                {/* ... more legal jargon ... */}
                            </div>

                            {/* Signature Area */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Sua Assinatura</label>
                                <ConsentClientWrapper bookingId={booking.id} healthData={booking.health_form} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-center text-[10px] text-white/20 flex items-center justify-center gap-2">
                    <Shield size={10} />
                    Assinado Digitalmente • IP Logged • Altus Ink Secure
                </div>
            </div>
        </div>
    )
}
