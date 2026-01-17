import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "../globals.css";
import LanguageModal from "@/components/LanguageModal";
import LiquidBackground from "@/components/LiquidBackground";
import CookieConsent from "@/components/CookieConsent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { adminOS } from "@/lib/services/admin-os"
import ThemeRegistry from "@/components/ThemeRegistry"

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
    const theme = await adminOS.getTheme();

    return (
        <html lang={locale} className="dark">
             <body className={`${inter.variable} ${orbitron.variable} font-body bg-bg-dark text-text-primary min-h-screen overflow-x-hidden selection:bg-neon-cyan/30 selection:text-neon-cyan`}>
                <NextIntlClientProvider messages={messages}>
                    {/* Premium Liquid Background (Deep Flow) */}
                    <LiquidBackground />

                    {/* Tech Background - Void + Subtle Grid (Overlay) */}
                   <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

                    {/* Content */}
                    <div className="relative z-10">
                        <ThemeRegistry initialTheme={theme} />
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
