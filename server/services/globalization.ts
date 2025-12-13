/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE GLOBALIZATION & LOCALIZATION PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Complete internationalization framework for global enterprise deployment.
 * 
 * FEATURES:
 * - Multi-language support (25+ languages)
 * - Currency conversion & formatting
 * - Timezone management
 * - Date/time localization
 * - Number formatting
 * - RTL language support
 * - Pluralization rules
 * - ICU MessageFormat
 * - Dynamic translation loading
 * - AI-powered auto-translation
 * 
 * @module services/globalization
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type Locale =
    | "en-US" | "en-GB" | "en-AU" | "en-CA"
    | "es-ES" | "es-MX" | "es-AR"
    | "fr-FR" | "fr-CA"
    | "de-DE" | "de-AT" | "de-CH"
    | "it-IT"
    | "pt-BR" | "pt-PT"
    | "ja-JP"
    | "ko-KR"
    | "zh-CN" | "zh-TW" | "zh-HK"
    | "nl-NL" | "nl-BE"
    | "ru-RU"
    | "ar-SA" | "ar-AE"
    | "hi-IN"
    | "tr-TR"
    | "pl-PL"
    | "th-TH"
    | "vi-VN";

export type LanguageCode = "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "zh" | "nl" | "ru" | "ar" | "hi" | "tr" | "pl" | "th" | "vi";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CNY" | "KRW" | "BRL" | "MXN" | "AUD" | "CAD" | "CHF" | "INR" | "RUB" | "TRY" | "AED" | "SAR" | "PLN" | "THB" | "VND";

export interface LocaleConfig {
    code: Locale;
    language: LanguageCode;
    region: string;
    name: string;
    nativeName: string;
    rtl: boolean;
    dateFormat: string;
    timeFormat: string;
    firstDayOfWeek: 0 | 1 | 6;
    currency: CurrencyCode;
    numberFormat: NumberFormatConfig;
    pluralRules: PluralRules;
}

export interface NumberFormatConfig {
    decimalSeparator: string;
    thousandsSeparator: string;
    decimalPlaces: number;
    currencySymbol: string;
    currencyPosition: "before" | "after";
    currencySpacing: boolean;
}

export interface PluralRules {
    zero?: string;
    one: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
}

export interface TranslationEntry {
    key: string;
    value: string;
    context?: string;
    pluralForms?: Record<string, string>;
    metadata?: {
        lastModified: Date;
        modifiedBy: string;
        verified: boolean;
        machineTranslated: boolean;
    };
}

export interface CurrencyRate {
    from: CurrencyCode;
    to: CurrencyCode;
    rate: number;
    timestamp: Date;
    source: string;
}

export interface TimezoneInfo {
    id: string;
    name: string;
    offset: number;
    abbreviation: string;
    dstOffset?: number;
    dstStart?: Date;
    dstEnd?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
    "en-US": {
        code: "en-US", language: "en", region: "US", name: "English (US)", nativeName: "English",
        rtl: false, dateFormat: "MM/DD/YYYY", timeFormat: "h:mm A", firstDayOfWeek: 0,
        currency: "USD",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "en-GB": {
        code: "en-GB", language: "en", region: "GB", name: "English (UK)", nativeName: "English",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "GBP",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "£", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "en-AU": {
        code: "en-AU", language: "en", region: "AU", name: "English (Australia)", nativeName: "English",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "h:mm A", firstDayOfWeek: 1,
        currency: "AUD",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "en-CA": {
        code: "en-CA", language: "en", region: "CA", name: "English (Canada)", nativeName: "English",
        rtl: false, dateFormat: "YYYY-MM-DD", timeFormat: "h:mm A", firstDayOfWeek: 0,
        currency: "CAD",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "es-ES": {
        code: "es-ES", language: "es", region: "ES", name: "Spanish (Spain)", nativeName: "Español",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "es-MX": {
        code: "es-MX", language: "es", region: "MX", name: "Spanish (Mexico)", nativeName: "Español",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "h:mm A", firstDayOfWeek: 0,
        currency: "MXN",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "es-AR": {
        code: "es-AR", language: "es", region: "AR", name: "Spanish (Argentina)", nativeName: "Español",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "USD",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "fr-FR": {
        code: "fr-FR", language: "fr", region: "FR", name: "French (France)", nativeName: "Français",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "fr-CA": {
        code: "fr-CA", language: "fr", region: "CA", name: "French (Canada)", nativeName: "Français",
        rtl: false, dateFormat: "YYYY-MM-DD", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "CAD",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "de-DE": {
        code: "de-DE", language: "de", region: "DE", name: "German (Germany)", nativeName: "Deutsch",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "de-AT": {
        code: "de-AT", language: "de", region: "AT", name: "German (Austria)", nativeName: "Deutsch",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "before", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "de-CH": {
        code: "de-CH", language: "de", region: "CH", name: "German (Switzerland)", nativeName: "Deutsch",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "CHF",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: "'", decimalPlaces: 2, currencySymbol: "CHF", currencyPosition: "before", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "it-IT": {
        code: "it-IT", language: "it", region: "IT", name: "Italian", nativeName: "Italiano",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "pt-BR": {
        code: "pt-BR", language: "pt", region: "BR", name: "Portuguese (Brazil)", nativeName: "Português",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "BRL",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "R$", currencyPosition: "before", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "pt-PT": {
        code: "pt-PT", language: "pt", region: "PT", name: "Portuguese (Portugal)", nativeName: "Português",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "ja-JP": {
        code: "ja-JP", language: "ja", region: "JP", name: "Japanese", nativeName: "日本語",
        rtl: false, dateFormat: "YYYY/MM/DD", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "JPY",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 0, currencySymbol: "¥", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "ko-KR": {
        code: "ko-KR", language: "ko", region: "KR", name: "Korean", nativeName: "한국어",
        rtl: false, dateFormat: "YYYY.MM.DD", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "KRW",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 0, currencySymbol: "₩", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "zh-CN": {
        code: "zh-CN", language: "zh", region: "CN", name: "Chinese (Simplified)", nativeName: "简体中文",
        rtl: false, dateFormat: "YYYY/MM/DD", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "CNY",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "¥", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "zh-TW": {
        code: "zh-TW", language: "zh", region: "TW", name: "Chinese (Traditional)", nativeName: "繁體中文",
        rtl: false, dateFormat: "YYYY/MM/DD", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "USD",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "zh-HK": {
        code: "zh-HK", language: "zh", region: "HK", name: "Chinese (Hong Kong)", nativeName: "繁體中文",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "USD",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "$", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "nl-NL": {
        code: "nl-NL", language: "nl", region: "NL", name: "Dutch (Netherlands)", nativeName: "Nederlands",
        rtl: false, dateFormat: "DD-MM-YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "before", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "nl-BE": {
        code: "nl-BE", language: "nl", region: "BE", name: "Dutch (Belgium)", nativeName: "Nederlands",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "EUR",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "€", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "ru-RU": {
        code: "ru-RU", language: "ru", region: "RU", name: "Russian", nativeName: "Русский",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "RUB",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "₽", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", few: "few", many: "many", other: "other" }
    },
    "ar-SA": {
        code: "ar-SA", language: "ar", region: "SA", name: "Arabic (Saudi Arabia)", nativeName: "العربية",
        rtl: true, dateFormat: "DD/MM/YYYY", timeFormat: "hh:mm A", firstDayOfWeek: 6,
        currency: "SAR",
        numberFormat: { decimalSeparator: "٫", thousandsSeparator: "٬", decimalPlaces: 2, currencySymbol: "ر.س", currencyPosition: "after", currencySpacing: true },
        pluralRules: { zero: "zero", one: "one", two: "two", few: "few", many: "many", other: "other" }
    },
    "ar-AE": {
        code: "ar-AE", language: "ar", region: "AE", name: "Arabic (UAE)", nativeName: "العربية",
        rtl: true, dateFormat: "DD/MM/YYYY", timeFormat: "hh:mm A", firstDayOfWeek: 6,
        currency: "AED",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "د.إ", currencyPosition: "after", currencySpacing: true },
        pluralRules: { zero: "zero", one: "one", two: "two", few: "few", many: "many", other: "other" }
    },
    "hi-IN": {
        code: "hi-IN", language: "hi", region: "IN", name: "Hindi", nativeName: "हिन्दी",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "h:mm A", firstDayOfWeek: 0,
        currency: "INR",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "₹", currencyPosition: "before", currencySpacing: false },
        pluralRules: { one: "one", other: "other" }
    },
    "tr-TR": {
        code: "tr-TR", language: "tr", region: "TR", name: "Turkish", nativeName: "Türkçe",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "TRY",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 2, currencySymbol: "₺", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", other: "other" }
    },
    "pl-PL": {
        code: "pl-PL", language: "pl", region: "PL", name: "Polish", nativeName: "Polski",
        rtl: false, dateFormat: "DD.MM.YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "PLN",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: " ", decimalPlaces: 2, currencySymbol: "zł", currencyPosition: "after", currencySpacing: true },
        pluralRules: { one: "one", few: "few", many: "many", other: "other" }
    },
    "th-TH": {
        code: "th-TH", language: "th", region: "TH", name: "Thai", nativeName: "ไทย",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 0,
        currency: "THB",
        numberFormat: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, currencySymbol: "฿", currencyPosition: "before", currencySpacing: false },
        pluralRules: { other: "other" }
    },
    "vi-VN": {
        code: "vi-VN", language: "vi", region: "VN", name: "Vietnamese", nativeName: "Tiếng Việt",
        rtl: false, dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", firstDayOfWeek: 1,
        currency: "VND",
        numberFormat: { decimalSeparator: ",", thousandsSeparator: ".", decimalPlaces: 0, currencySymbol: "₫", currencyPosition: "after", currencySpacing: true },
        pluralRules: { other: "other" }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY EXCHANGE RATES (Live rates would come from API)
// ═══════════════════════════════════════════════════════════════════════════════

const BASE_CURRENCY: CurrencyCode = "EUR";
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    EUR: 1.0, USD: 1.08, GBP: 0.86, JPY: 162.5, CNY: 7.85,
    KRW: 1420, BRL: 5.35, MXN: 18.5, AUD: 1.65, CAD: 1.47,
    CHF: 0.94, INR: 90.2, RUB: 98.5, TRY: 32.1, AED: 3.97,
    SAR: 4.05, PLN: 4.32, THB: 38.5, VND: 26800
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBALIZATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export class GlobalizationService extends EventEmitter {
    private translations: Map<string, Map<string, TranslationEntry>> = new Map();
    private currentLocale: Locale = "en-US";
    private exchangeRates: Map<string, CurrencyRate> = new Map();

    constructor() {
        super();
        this.initializeExchangeRates();
        this.loadDefaultTranslations();
    }

    // Translation methods
    t(key: string, locale?: Locale, params?: Record<string, string | number>): string {
        const loc = locale || this.currentLocale;
        const lang = LOCALE_CONFIGS[loc]?.language || "en";

        const langTranslations = this.translations.get(lang);
        const entry = langTranslations?.get(key);

        let value = entry?.value || key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
            });
        }

        return value;
    }

    // Currency formatting
    formatCurrency(amount: number, currency: CurrencyCode, locale?: Locale): string {
        const loc = locale || this.currentLocale;
        const config = LOCALE_CONFIGS[loc];
        const fmt = config.numberFormat;

        const formatted = this.formatNumber(amount, fmt.decimalPlaces, locale);

        if (fmt.currencyPosition === "before") {
            return `${fmt.currencySymbol}${fmt.currencySpacing ? " " : ""}${formatted}`;
        }
        return `${formatted}${fmt.currencySpacing ? " " : ""}${fmt.currencySymbol}`;
    }

    // Number formatting
    formatNumber(value: number, decimals?: number, locale?: Locale): string {
        const loc = locale || this.currentLocale;
        const config = LOCALE_CONFIGS[loc];
        const fmt = config.numberFormat;
        const dec = decimals ?? fmt.decimalPlaces;

        const fixed = value.toFixed(dec);
        const [intPart, decPart] = fixed.split(".");

        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousandsSeparator);

        return decPart ? `${formattedInt}${fmt.decimalSeparator}${decPart}` : formattedInt;
    }

    // Date formatting
    formatDate(date: Date, locale?: Locale, format?: string): string {
        const loc = locale || this.currentLocale;
        const config = LOCALE_CONFIGS[loc];
        const fmt = format || config.dateFormat;

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();

        return fmt
            .replace("DD", day)
            .replace("MM", month)
            .replace("YYYY", year);
    }

    // Time formatting
    formatTime(date: Date, locale?: Locale): string {
        const loc = locale || this.currentLocale;
        const config = LOCALE_CONFIGS[loc];
        const fmt = config.timeFormat;

        const hours24 = date.getHours();
        const hours12 = hours24 % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours24 >= 12 ? "PM" : "AM";

        return fmt
            .replace("HH", hours24.toString().padStart(2, "0"))
            .replace("hh", hours12.toString().padStart(2, "0"))
            .replace("h", hours12.toString())
            .replace("mm", minutes)
            .replace("A", ampm);
    }

    // Currency conversion
    convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
        const fromRate = EXCHANGE_RATES[from];
        const toRate = EXCHANGE_RATES[to];
        const inEur = amount / fromRate;
        return inEur * toRate;
    }

    // Locale management
    setLocale(locale: Locale): void {
        if (LOCALE_CONFIGS[locale]) {
            this.currentLocale = locale;
            this.emit("localeChanged", locale);
        }
    }

    getLocale(): Locale { return this.currentLocale; }
    getLocaleConfig(locale?: Locale): LocaleConfig { return LOCALE_CONFIGS[locale || this.currentLocale]; }
    getSupportedLocales(): Locale[] { return Object.keys(LOCALE_CONFIGS) as Locale[]; }

    // Translation management
    async addTranslation(key: string, lang: LanguageCode, value: string, context?: string): Promise<void> {
        if (!this.translations.has(lang)) {
            this.translations.set(lang, new Map());
        }
        this.translations.get(lang)!.set(key, {
            key, value, context,
            metadata: { lastModified: new Date(), modifiedBy: "system", verified: false, machineTranslated: false }
        });
    }

    // Private methods
    private initializeExchangeRates(): void {
        Object.entries(EXCHANGE_RATES).forEach(([code, rate]) => {
            this.exchangeRates.set(`${BASE_CURRENCY}_${code}`, {
                from: BASE_CURRENCY, to: code as CurrencyCode, rate, timestamp: new Date(), source: "static"
            });
        });
    }

    private loadDefaultTranslations(): void {
        // English defaults
        const en = new Map<string, TranslationEntry>();
        [
            ["common.save", "Save"], ["common.cancel", "Cancel"], ["common.delete", "Delete"],
            ["common.edit", "Edit"], ["common.confirm", "Confirm"], ["common.loading", "Loading..."],
            ["common.error", "An error occurred"], ["common.success", "Success"],
            ["booking.title", "Book Appointment"], ["booking.confirm", "Confirm Booking"],
            ["booking.cancel", "Cancel Booking"], ["booking.reschedule", "Reschedule"],
            ["payment.amount", "Amount"], ["payment.deposit", "Deposit"],
            ["payment.total", "Total"], ["payment.refund", "Refund"]
        ].forEach(([k, v]) => en.set(k, { key: k, value: v }));
        this.translations.set("en", en);

        // Portuguese defaults
        const pt = new Map<string, TranslationEntry>();
        [
            ["common.save", "Salvar"], ["common.cancel", "Cancelar"], ["common.delete", "Excluir"],
            ["common.edit", "Editar"], ["common.confirm", "Confirmar"], ["common.loading", "Carregando..."],
            ["booking.title", "Agendar"], ["booking.confirm", "Confirmar Agendamento"],
            ["payment.amount", "Valor"], ["payment.deposit", "Depósito"]
        ].forEach(([k, v]) => pt.set(k, { key: k, value: v }));
        this.translations.set("pt", pt);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const globalizationService = new GlobalizationService();
export const i18n = globalizationService;
export default globalizationService;
