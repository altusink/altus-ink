import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency,
    }).format(amount)
}

export function formatDate(date: Date | string, locale: string = 'pt-BR'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(dateObj)
}

export function formatTime(date: Date | string, locale: string = 'pt-BR'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj)
}

export function calculateDuration(tattooType: string): number {
    const durations: Record<string, number> = {
        'small': 1,
        'medium': 2.5,
        'large': 4,
        'extra-large': 6,
    }
    return durations[tattooType] || 2
}

export function calculatePrice(duration: number, hourlyRate: number): number {
    return duration * hourlyRate
}

export function calculateDeposit(totalPrice: number, depositPercentage: number = 0.3): number {
    return totalPrice * depositPercentage
}
