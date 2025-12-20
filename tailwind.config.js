/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    // Cores principais
                    green: '#39FF14',
                    blue: '#00F5FF',
                    // Elementos 3D
                    pink: '#FF006E',
                    purple: '#8B00FF',
                    // Dourado da logo
                    gold: '#B8860B',
                },
                bg: {
                    dark: '#0A0A0F',
                    card: '#1A1A2E',
                    hover: '#252540',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#B8B8D1',
                    muted: '#6B6B8D',
                },
            },
            fontFamily: {
                heading: ['var(--font-orbitron)', 'sans-serif'],
                body: ['var(--font-inter)', 'sans-serif'],
                hero: ['var(--font-orbitron)', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #39FF14 0%, #00F5FF 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)',
                'gradient-gold': 'linear-gradient(135deg, #B8860B 0%, #FFD700 100%)',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.3s ease-in',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                glow: {
                    'from': {
                        textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #39FF14, 0 0 40px #39FF14',
                    },
                    'to': {
                        textShadow: '0 0 20px #fff, 0 0 30px #00F5FF, 0 0 40px #00F5FF, 0 0 50px #00F5FF',
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideUp: {
                    'from': { transform: 'translateY(100%)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
            },
            boxShadow: {
                'neon-green': '0 0 20px rgba(57, 255, 20, 0.5)',
                'neon-blue': '0 0 20px rgba(0, 245, 255, 0.5)',
                'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
                'neon-purple': '0 0 20px rgba(139, 0, 255, 0.5)',
                'neon-gold': '0 0 20px rgba(184, 134, 11, 0.5)',
            },
        },
    },
    plugins: [],
}
