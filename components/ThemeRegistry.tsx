'use client'

import { useEffect, useState } from 'react'
import { ThemeConfig } from '@/lib/types/admin'

export default function ThemeRegistry({ initialTheme }: { initialTheme?: ThemeConfig }) {
    const [theme, setTheme] = useState<ThemeConfig | undefined>(initialTheme)

    useEffect(() => {
        // If we want real-time updates without reload, we could subscribe to Supabase here
        // For now, we rely on the server-passed initialTheme or local state updates if needed
    }, [])

    if (!theme) return null

    return (
        <style jsx global>{`
            :root {
                --color-neon-primary: ${theme.primaryColor};
                --color-neon-secondary: ${theme.secondaryColor};
                --glass-opacity: ${theme.glassOpacity};
                --radius-app: ${theme.borderRadius};
                --font-heading: ${theme.fontHeading}, monospace;
            }

            .neon-text-primary {
                color: var(--color-neon-primary);
                text-shadow: 0 0 10px var(--color-neon-primary);
            }
            
            .neon-border-primary {
                border-color: var(--color-neon-primary);
                box-shadow: 0 0 10px var(--color-neon-primary);
            }

            ${theme.enableScanlines ? `
            .scanlines::before {
                content: " ";
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                z-index: 999;
                background-size: 100% 2px, 3px 100%;
                pointer-events: none;
            }
            ` : ''}
        `}</style>
    )
}
