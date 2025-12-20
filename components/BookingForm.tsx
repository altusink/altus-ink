'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TOUR_SCHEDULE, PRICING_RULES, type Country, type City } from '@/config/tour-schedule'
import FileUpload from './FileUpload'
import SelectableCard from './ui/SelectableCard'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Info, Loader2, MapPin, MessageCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

// ... (schema remains same)

// ... (renderStep2 inside component)

// --- Types & Schema match API ---
const bookingSchema = z.object({
    artistId: z.string().uuid(),
    // Location (Tour)
    countryId: z.string().min(1, 'Select a country'),
    cityId: z.string().min(1, 'Select a city'),

    // Personal Info
    clientName: z.string().min(2, 'Name is required'),
    clientEmail: z.string().email('Invalid email'),
    clientPhone: z.string().min(10, 'Valid phone required'),
    clientLanguage: z.string().default('pt'),

    // Details
    bookingDate: z.string().min(1, 'Date required'),
    bookingTime: z.string().min(1, 'Time required'),

    // Tattoo Specs
    tattooType: z.enum(['small', 'medium', 'large', 'xl', 'coverup']),
    tattooDescription: z.string().optional(),
    bodyLocation: z.string().min(1, 'Placement required'),

    // New Advanced Fields
    referenceImages: z.any().optional(), // File[] handled separately or via upload component
    customizationType: z.enum(['as_is', 'with_changes']).default('as_is'),
    customizationDetails: z.string().max(600).optional(),

    estimatedPrice: z.number().nullable(),
    depositAmount: z.number().positive(),

    healthForm: z.object({
        allergies: z.string().optional(),
        medications: z.string().optional(),
        medicalConditions: z.string().optional(),
        pregnant: z.boolean().optional(),
    }).optional(),
    
    healthForm: z.object({
        allergies: z.string().optional(),
        medications: z.string().optional(),
        medicalConditions: z.string().optional(),
        pregnant: z.boolean().optional(),
    }).optional(),
    
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms"
    }),

    // Payment
    paymentMethod: z.enum(['stripe', 'pix']).default('stripe'),
})

type BookingFormData = z.infer<typeof bookingSchema>

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!) // Removed in favor of dynamic loading

// --- Payment Component ---
function PaymentForm({ clientSecret, bookingId, onSuccess, buttonLabel }: { clientSecret: string, bookingId: string, onSuccess: () => void, buttonLabel: string }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setIsLoading(true)
        setError(null)

        const { error: submitError } = await elements.submit()
        if (submitError) {
            setError(submitError.message || 'Payment error')
            setIsLoading(false)
            return
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/booking-success?bookingId=${bookingId}`,
            },
            redirect: 'if_required' // Handle manually if possible for smoother UX, or let it redirect
        })

        if (confirmError) {
            setError(confirmError.message || 'Payment failed')
        } else {
            onSuccess()
        }
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full py-4 bg-neon-green text-bg-dark font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : buttonLabel}
            </button>
        </form>
    )
}


// --- Main Form Component ---
// ... (Top Imports)
// ... Imports

export default function BookingForm({ artists, stripePublicKey }: { artists: any[], stripePublicKey: string }) {
    // Initialize Stripe with Prop Key
    // useMemo or useState to ensure we don't recreate it unnecessarily, 
    // though loadStripe handles this internally efficiently.
    const [stripePromise, setStripePromise] = useState<any>(null)

    useEffect(() => {
        if (stripePublicKey) {
            loadStripe(stripePublicKey).then(setStripePromise)
        }
    }, [stripePublicKey])

    const t = useTranslations('Booking')
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            // ... defaults
            customizationType: 'as_is',
            tattooType: 'small'
        }
    })
    
    // --- Missing State & Variables Restored ---
    const watchDate = watch('bookingDate')
    const watchTime = watch('bookingTime')
    const depositAmount = watch('depositAmount') || 50 // Default logic
    
    // Navigation State
    const [step, setStep] = useState(1)
    
    // Payment State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'pix' | 'pix_manual'>('stripe')
    const [brlRate, setBrlRate] = useState<number | null>(6.5) // Fallback rate
    const [clientSecret, setClientSecret] = useState('')
    const [bookingId, setBookingId] = useState('')
    
    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)
    
    // Fetch BRL Rate (Mock or Logic)
    useEffect(() => {
        // Mock fetch rate
        setBrlRate(6.5) 
    }, [])

    const onSubmit = (data: BookingFormData) => {
        // Placeholder for Submission Logic if not present
        console.log("Submit:", data)
    }

    const renderHeader = () => (
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                    {t('title')}
                </span>
            </h1>
            <p className="text-text-secondary">{t('subtitle')}</p>
        </div>
    )

    // ... Existing State
    const [tourSegments, setTourSegments] = useState<any[]>([])
    const supabase = createClient()

    // Fetch Tour Segments
    useEffect(() => {
        const fetchSegments = async () => {
            const { data } = await supabase.from('tour_segments').select('*')
            if (data) setTourSegments(data)
        }
        fetchSegments()
    }, [])

    // Derive Countries/Cities from Tour Segments
    const dynamicLocations = tourSegments.reduce((acc: any[], curr) => {
        let country = acc.find(c => c.name === curr.country_name)
        if (!country) {
            country = {
                id: curr.country_name, // Using name as ID for simplicity or generate one
                name: curr.country_name,
                flag: curr.country_flag,
                cities: []
            }
            acc.push(country)
        }
        if (!country.cities.find((city: any) => city.name === curr.city_name)) {
            country.cities.push({
                id: curr.city_name, // Using name as ID
                name: curr.city_name
            })
        }
        return acc
    }, [])

    // Check if a date is allowed for the selected city
    const isDateAllowed = (date: Date) => {
        const selectedCityName = watch('cityId') // We used ID=Name in logic above
        if (!selectedCityName) return false

        // specific segments for this city
        const citySegments = tourSegments.filter(s => s.city_name === selectedCityName)

        // Check if date is within any segment
        const dateStr = format(date, 'yyyy-MM-dd')
        return citySegments.some(s => dateStr >= s.start_date && dateStr <= s.end_date)
    }

    // ... (Existing Renders)

    // step 1: CONFIGURATION (Modified to use dynamicLocations)
    const renderStep1 = () => {
        const selectedCountryId = watch('countryId')
        // Use dynamicLocations if available, otherwise fallback to static (optional, or just empty)
        const countries = dynamicLocations.length > 0 ? dynamicLocations : []

        const currentCountry = countries.find(c => c.id === selectedCountryId)
        const currentCities = currentCountry?.cities || []

        return (
            <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="bg-neon-green text-bg-dark rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                    {t('steps.configuration')}
                </h2>

                <div className="space-y-6">
                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-2">{t('form.country')}</label>
                            <select
                                {...register('countryId')}
                                className="w-full bg-bg-card border border-white/10 rounded-xl p-3 text-white focus:border-neon-green outline-none"
                            >
                                <option value="">Select Country</option>
                                {countries.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-2">{t('form.city')}</label>
                            <select
                                {...register('cityId')}
                                disabled={!selectedCountryId}
                                className="w-full bg-bg-card border border-white/10 rounded-xl p-3 text-white focus:border-neon-green outline-none disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {currentCities.map((city: any) => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* ... Rest of Step 1 ... */}
                    {/* Tattoo Type */}
                    <div>
                        <label className="block text-sm text-text-muted mb-3">{t('form.tattoo_type')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {(Object.entries(PRICING_RULES) as [string, any][]).map(([key, rule]) => {
                                const isSelected = watch('tattooType') === key
                                return (
                                    <SelectableCard
                                        key={key}
                                        isSelected={isSelected}
                                        onClick={() => setValue('tattooType', key as any)}
                                        title={rule.label}
                                        subtitle={rule.price ? `€${rule.price}+` : 'Sob Consulta'}
                                        icon={
                                            <>
                                               {key === 'small' && <div className="w-4 h-4 rounded-sm border-2 border-current" />}
                                               {key === 'medium' && <div className="w-5 h-5 rounded-sm border-2 border-current" />}
                                               {key === 'large' && <div className="w-6 h-6 rounded-sm border-2 border-current" />}
                                               {key === 'xl' && <div className="w-7 h-7 rounded-sm border-2 border-current" />}
                                               {key === 'coverup' && <div className="w-5 h-5 rounded-full border-2 border-dashed border-current" />}
                                            </>
                                        }
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {/* Placement & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-2">{t('form.placement')} <span className="text-neon-pink">*</span></label>
                            <input
                                {...register('bodyLocation')}
                                placeholder="ex. Forearm, Back"
                                className={`w-full bg-bg-card border rounded-xl p-3 text-white outline-none focus:border-neon-green ${errors.bodyLocation ? 'border-red-500' : 'border-white/10'}`}
                            />
                            {errors.bodyLocation && <span className="text-red-500 text-xs mt-1">{t('form.required_field') || 'Este campo é obrigatório'}</span>}
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-2">{t('form.description')}</label>
                            <textarea
                                {...register('tattooDescription')}
                                placeholder="Describe your idea..."
                                className="w-full bg-bg-card border border-white/10 rounded-xl p-3 text-white focus:border-neon-green outline-none h-24"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm text-text-muted mb-2">{t('form.reference_images')}</label>
                        <FileUpload onFilesSelected={(files) => setValue('referenceImages', files)} />
                    </div>
                </div>
            </div>
        )
    }

    // step 2: SCHEDULE (STRICT MODE - CEO SLOTS ONLY)
    const renderStep2 = () => {
        const selectedCityName = watch('cityId')
        
        // 1. Get Segments for City
        const citySegments = tourSegments.filter(s => s.city_name === selectedCityName)

        // 2. Flatten into a sorted list of unique dates
        // We'll use a straightforward approach to generate all dates
        const allDates: Date[] = []
        citySegments.forEach(segment => {
            let current = new Date(segment.start_date + 'T12:00:00') // Force noon to avoid TZ issues
            const end = new Date(segment.end_date + 'T12:00:00')
            
            while (current <= end) {
                // Avoid duplicates if segments overlap (rare but possible)
                if (!allDates.find(d => d.getTime() === current.getTime())) {
                    allDates.push(new Date(current))
                }
                current.setDate(current.getDate() + 1)
            }
        })
        
        // Sort
        allDates.sort((a, b) => a.getTime() - b.getTime())

        // 3. Determine available slots for the SELECTED date
        let availableSlots: string[] = [] 
        if (watchDate) {
            const segment = tourSegments.find(s =>
                s.city_name === selectedCityName &&
                s.start_date <= watchDate &&
                s.end_date >= watchDate
            )
            if (segment && segment.time_slots) {
                availableSlots = segment.time_slots
            }
        }

        return (
            <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="bg-neon-green text-bg-dark rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                    {t('steps.schedule')}
                </h2>

                <div className="flex flex-col gap-8">
                    {/* Date Selection - REPLACED CALENDAR WITH BUTTONS */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Escolha uma Data</h3>
                        {allDates.length === 0 ? (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-text-muted italic">
                                Nenhuma data disponível para esta cidade no momento.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {allDates.map((date) => {
                                    const dateStr = format(date, 'yyyy-MM-dd')
                                    const isSelected = watchDate === dateStr
                                    
                                    // Formatting: "15 Out"
                                    const dayAndMonth = format(date, 'dd MMM', { locale: ptBR })
                                    // Formatting: "Sexta"
                                    const weekDay = format(date, 'EEE', { locale: ptBR })
                                    // Capitalize first letter
                                    const weekDayCapitalized = weekDay.charAt(0).toUpperCase() + weekDay.slice(1)

                                    return (
                                        <SelectableCard
                                            key={dateStr}
                                            variant="date"
                                            isSelected={isSelected}
                                            onClick={() => {
                                                setValue('bookingDate', dateStr)
                                                setValue('bookingTime', '') // Reset time when date changes
                                            }}
                                        >
                                            <span className="text-sm font-bold opacity-80 uppercase tracking-wider text-[0.7rem] mb-1">
                                                {weekDayCapitalized}
                                            </span>
                                            <span className="text-lg font-bold">
                                                {dayAndMonth}
                                            </span>
                                        </SelectableCard>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Time Slots (Only visible if date selected) */}
                    {watchDate && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold text-white mb-4">{t('form.select_time')}</h3>
                            {availableSlots.length === 0 ? (
                                <div className="text-red-400 italic bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                    Nenhum horário disponível para esta data.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {availableSlots.map((time) => (
                                        <SelectableCard
                                            key={time}
                                            isSelected={watchTime === time}
                                            onClick={() => setValue('bookingTime', time)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${watchTime === time ? 'bg-bg-dark' : 'bg-neon-green'}`} />
                                            {time}
                                        </SelectableCard>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ... (rest of component)

    // step 3: CHECKOUT (Personal + Payment)
    const renderStep3 = () => {
        // If we have a clientSecret, it means we successfully created the booking and selected Stripe.
        // So we show the Payment Element.
        if (clientSecret && bookingId) {
            return (
                <div className="max-w-md mx-auto animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Pagamento Seguro</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#00ff9d' } } }}>
                            <PaymentForm
                                clientSecret={clientSecret}
                                bookingId={bookingId}
                                onSuccess={() => window.location.href = `/booking-success?bookingId=${bookingId}`}
                                buttonLabel={`Pagar Sinal de €${watch('depositAmount')}`}
                            />
                        </Elements>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="bg-neon-green text-bg-dark rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                    {t('steps.payment')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Personal Data */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">{t('steps.personal_info')}</h3>
                        <div className="space-y-4">
                            <input {...register('clientName')} placeholder={t('form.full_name')} className="w-full bg-bg-card border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none" />
                            <input {...register('clientEmail')} type="email" placeholder={t('form.email')} className="w-full bg-bg-card border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none" />
                            <input {...register('clientPhone')} placeholder={t('form.phone')} className="w-full bg-bg-card border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none" />

                            <div className="pt-4">
                                <h4 className="text-sm font-semibold text-white mb-2">{t('form.health_form')}</h4>
                                <input {...register('healthForm.allergies')} placeholder={t('form.allergies')} className="w-full bg-bg-card border border-white/10 rounded-lg p-3 text-white focus:border-neon-green outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Method Selection */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                            <div>
                                <p className="text-sm text-text-muted">Total (Estimado)</p>
                                <p className="text-xl font-bold text-white">{PRICING_RULES[watch('tattooType') as keyof typeof PRICING_RULES]?.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-neon-green font-bold">Sinal a Pagar</p>
                                <p className="text-3xl font-bold text-neon-green">€{watch('depositAmount')}</p>
                            </div>
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-3">Método de Pagamento</h4>
                        <h4 className="text-sm font-semibold text-white mb-3">Como deseja pagar?</h4>
                        <div className="space-y-3 mb-6">
                            {/* Option A: Pix (Brasil) */}
                            <div
                                onClick={() => setSelectedPaymentMethod('pix')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPaymentMethod === 'pix'
                                    ? 'bg-neon-green/10 border-neon-green text-white'
                                    : 'bg-black/20 border-white/10 text-text-muted hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><div className="w-4 h-4 rotate-45 border border-white rounded-sm" /></div>
                                    <div className="text-left">
                                        <span className="font-medium block">Pix (Conta Brasil)</span>
                                        <span className="text-xs opacity-70">
                                            {brlRate
                                                ? `Aprox. R$ ${(depositAmount * brlRate).toFixed(2)} (Sem IOF)`
                                                : 'Carregando cotação...'}
                                        </span>
                                    </div>
                                </div>
                                {selectedPaymentMethod === 'pix' && <Check className="w-5 h-5 text-neon-green" />}
                            </div>

                            {/* Option B: Euro (Stripe) */}
                            <div
                                onClick={() => setSelectedPaymentMethod('stripe')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPaymentMethod === 'stripe'
                                    ? 'bg-neon-green/10 border-neon-green text-white'
                                    : 'bg-black/20 border-white/10 text-text-muted hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><div className="w-4 h-4 bg-white rounded-sm" /></div>
                                    <div className="text-left">
                                        <span className="font-medium block">Euro (Cartão / Banco)</span>
                                        <span className="text-xs opacity-70">Cobrança em €{depositAmount}</span>
                                    </div>
                                </div>
                                {selectedPaymentMethod === 'stripe' && <Check className="w-5 h-5 text-neon-green" />}
                            </div>
                        </div>


                        {/* Info Box based on Selection */}
                        {selectedPaymentMethod === 'pix_manual' && (
                            <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 text-xs text-neon-blue mb-4">
                                Você receberá a chave PIX no próximo passo ou por e-mail/WhatsApp. O agendamento ficará "Pendente" até a confirmação.
                            </div>
                        )}

                        {/* Terms & Conditions Checkbox */}
                        <div className="mb-6">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative pt-1">
                                    <input 
                                        type="checkbox"
                                        className="peer sr-only"
                                        {...register('termsAccepted', { required: true })}
                                    />
                                    <div className="w-5 h-5 rounded border border-white/30 peer-checked:bg-neon-green peer-checked:border-neon-green transition-colors flex items-center justify-center">
                                        <Check className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="text-sm text-text-muted group-hover:text-white transition-colors">
                                    Li e concordo com os <a href="/politica-privacidade" target="_blank" className="text-neon-green hover:underline">Termos de Serviço</a>, política de cancelamento e declaro que as informações de saúde são verdadeiras.
                                </div>
                            </label>
                            {errors.termsAccepted && (
                                <span className="text-red-500 text-xs mt-1 block">Você precisa aceitar os termos para continuar.</span>
                            )}
                        </div>

                         {/* Age Verification & ID Warning */}
                        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <label className="flex items-start gap-3 cursor-pointer group mb-2">
                                <div className="relative pt-1">
                                    <input 
                                        type="checkbox"
                                        className="peer sr-only"
                                        required 
                                    />
                                    <div className="w-5 h-5 rounded border border-white/30 peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-colors flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                                    Declaro que sou maior de 18 anos.
                                </div>
                            </label>
                            <div className="flex items-start gap-2 text-xs text-orange-200 ml-8">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>É obrigatória a apresentação de documento original com foto no dia da sessão.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={() => setValue('paymentMethod', selectedPaymentMethod === 'stripe' ? 'stripe' : 'pix')}
                            disabled={isSubmitting || !watch('termsAccepted')}
                            className="w-full py-4 bg-neon-green text-bg-dark font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> :
                                selectedPaymentMethod === 'stripe' ? 'Ir para Pagamento' : 'Confirmar Agendamento'
                            }
                        </button>

                        <div className="mt-4 flex items-start gap-2 text-xs text-text-muted bg-black/20 p-3 rounded-lg">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            <p>{t('non_refundable_msg')}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {renderHeader()}
            <div className="max-w-4xl mx-auto bg-bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                {/* Progress Bar (3 Steps) */}
                <div className="flex justify-between items-center mb-10 px-4 relative max-w-sm mx-auto">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -z-10" />
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${step >= 1 ? 'bg-neon-green border-neon-green text-bg-dark shadow-[0_0_15px_rgba(0,255,157,0.5)]' : 'bg-bg-dark border-white/20 text-text-muted'
                            }`}
                    >
                        1
                    </div>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${step >= 2 ? 'bg-neon-green border-neon-green text-bg-dark shadow-[0_0_15px_rgba(0,255,157,0.5)]' : 'bg-bg-dark border-white/20 text-text-muted'
                            }`}
                    >
                        2
                    </div>
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${step >= 3 ? 'bg-neon-green border-neon-green text-bg-dark shadow-[0_0_15px_rgba(0,255,157,0.5)]' : 'bg-bg-dark border-white/20 text-text-muted'
                            }`}
                    >
                        3
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons (Hide in Step 3 because Step 3's "Submit" button is inside the render function now) */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                        {step > 1 && !clientSecret && ( // Hide back button if we are showing the stripe form
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 text-white flex items-center gap-2 transition-colors"
                            >
                                <ChevronLeft size={16} /> {t('buttons.back')}
                            </button>
                        )}

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!watch('countryId') || !watch('cityId') || !watch('tattooType')}
                                className="ml-auto px-8 py-3 bg-neon-blue text-white font-bold rounded-xl hover:bg-neon-blue/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-neon-blue/20"
                            >
                                {t('buttons.next')} <ChevronRight size={16} />
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                type="button"
                                onClick={nextStep} // Just Next, Submit is in Step 3 now
                                disabled={!watchDate || !watchTime}
                                className="ml-auto px-8 py-3 bg-gradient-to-r from-neon-green to-emerald-500 text-bg-dark font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-neon-green/20"
                            >
                                {t('buttons.next')} <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
