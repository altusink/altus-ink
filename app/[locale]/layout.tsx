import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "../globals.css";
import LanguageModal from "@/components/LanguageModal";
import VisualEffects from "@/components/VisualEffects";
import CookieConsent from "@/components/CookieConsent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const orbitron = Orbitron({
    subsets: ["latin"],
    variable: "--font-orbitron",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Altus Ink - Premium Tattoo Studio",
    description: "Experience the art of tattooing at its finest. Book your session with world-class artists.",
    keywords: ["tattoo", "tatuagem", "tattoo studio", "premium tattoo", "altus ink", "danilo santos"],
    authors: [{ name: "Altus Ink" }],
    openGraph: {
        title: "Altus Ink - Premium Tattoo Studio",
        description: "Experience the art of tattooing at its finest",
        type: "website",
        locale: "pt_BR",
        images: ["/images/logo.png"],
    },
    icons: {
        icon: "/images/logo.png",
    },
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const messages = await getMessages();
    const { locale } = await params;

    return (
        <html lang={locale} className="dark">
            <body className={`${inter.variable} ${orbitron.variable} font-body`}>
                <NextIntlClientProvider messages={messages}>
                    {/* Visual Effects - Aurora + Orbs */}
                    <VisualEffects />

                    {/* Content with proper z-index */}
                    <div className="relative z-10">
                        <LanguageModal />
                        <CookieConsent />
                        {children}
                        <Analytics />
                        <SpeedInsights />
                    </div>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
