'use client'

import { useState } from 'react'
import { Link } from '@/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function FAQList() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const t = useTranslations('FAQ')

    // Using raw seems risky if type safety is strict, but iterate over keys 0-14
    const faqs = Array.from({ length: 15 }, (_, i) => ({
        question: t(`items.${i}.question`),
        answer: t(`items.${i}.answer`)
    }))

    return (
        <div className="pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-heading font-bold mb-4 text-center">
                    <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                        {t('title')}
                    </span>
                </h1>
                <p className="text-text-secondary text-center mb-12 text-lg">
                    {t('subtitle')}
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg md:text-xl font-heading font-bold text-white pr-4">
                                    {faq.question}
                                </h3>
                                {openIndex === index ? (
                                    <ChevronUp className="w-6 h-6 text-neon-green flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-neon-green flex-shrink-0" />
                                )}
                            </button>

                            {openIndex === index && (
                                <p className="mt-4 text-text-secondary leading-relaxed">
                                    {faq.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border border-white/10 backdrop-blur-xl text-center">
                    <h3 className="text-2xl font-heading font-bold text-white mb-4">
                        {t('still_have_questions')}
                    </h3>
                    <p className="text-text-secondary mb-6">
                        {t('contact_text')}
                    </p>
                    <Link
                        href="/contato"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                    >
                        {t('contact_button')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
