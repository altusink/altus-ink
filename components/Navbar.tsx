'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/navigation'
import Image from 'next/image'
import { Menu, X, LogIn } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from 'next-intl'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const t = useTranslations('Navbar')

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/artistas', label: t('artists') },
        { href: '/sobre', label: t('about') },
        { href: '/contato', label: t('contact') },
        { href: '/faq', label: t('faq') },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
                ? 'bg-bg-dark/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative w-[40px] h-[40px]">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink mask-brand-symbol"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-text-secondary hover:text-neon-cyan transition-colors duration-300 font-medium relative group"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}

                        <LanguageSelector />

                        <Link
                            href="/agendar"
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-semibold hover:shadow-neon-cyan transition-all duration-300 hover:scale-105"
                        >
                            {t('book')}
                        </Link>

                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-neon-purple text-neon-purple font-semibold hover:bg-neon-purple hover:text-bg-dark transition-all duration-300"
                        >
                            <LogIn className="w-4 h-4" />
                            {t('login')}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 md:hidden">
                        <LanguageSelector />
                        <button
                            className="text-text-primary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 animate-slide-up border-t border-white/10">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-text-secondary hover:text-neon-cyan transition-colors duration-300 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <Link
                                href="/agendar"
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-bg-dark font-semibold text-center"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('book')}
                            </Link>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-neon-purple text-neon-purple font-semibold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LogIn className="w-4 h-4" />
                                {t('login')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
