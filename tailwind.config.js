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
                // Nova Paleta Tech Neon (Sem Verde)
                neon: {
                    cyan: '#00F0FF',      // O novo "Green" (Ação Principal)
                    blue: '#0066FF',      // Tech Blue
                    purple: '#7000FF',    // Deep Violet
                    pink: '#FF003C',      // Glitch Red/Pink
                    
                    // Manter compatibilidade do código antigo mapeando 'green' para 'cyan' temporariamente
                    // até refatorarmos tudo, ou quebrar de propósito para achar onde trocar.
                    // Vamos mapear para Cyan para não quebrar build imediato, mas visualmente será azul.
                    green: '#00F0FF', 
                },
                bg: {
                    dark: '#050505',      // Void Black
                    card: '#0A0A12',      // Deep Space
                    hover: '#141424',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#A0A0C0', // Cool Gray
                    muted: '#505070',
                },
            },
            fontFamily: {
                heading: ['var(--font-orbitron)', 'sans-serif'],
                body: ['var(--font-inter)', 'sans-serif'],
                hero: ['var(--font-orbitron)', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)', // Cyan -> Purple
                'gradient-secondary': 'linear-gradient(135deg, #7000FF 0%, #FF003C 100%)', // Purple -> Red
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
                        textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #00F0FF, 0 0 40px #00F0FF',
                    },
                    'to': {
                        textShadow: '0 0 20px #fff, 0 0 30px #7000FF, 0 0 40px #7000FF, 0 0 50px #7000FF',
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
                'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.6)',
                'neon-purple': '0 0 20px rgba(112, 0, 255, 0.6)',
                'neon-pink': '0 0 20px rgba(255, 0, 60, 0.6)',
                // Legacy map
                'neon-green': '0 0 20px rgba(0, 240, 255, 0.6)',
            },
        },
    },
    plugins: [],
}
