export default function FloatingElements() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {/* Pink Orb - Top Left */}
            <div
                className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl opacity-30"
                style={{
                    top: '5%',
                    left: '5%',
                    background: 'radial-gradient(circle, rgba(255, 0, 110, 0.4) 0%, rgba(255, 0, 110, 0.1) 50%, transparent 100%)',
                    animation: 'float 8s ease-in-out infinite',
                }}
            />

            {/* Purple Orb - Top Right */}
            <div
                className="absolute w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full blur-3xl opacity-30"
                style={{
                    top: '10%',
                    right: '5%',
                    background: 'radial-gradient(circle, rgba(139, 0, 255, 0.4) 0%, rgba(139, 0, 255, 0.1) 50%, transparent 100%)',
                    animation: 'float 10s ease-in-out infinite',
                    animationDelay: '2s',
                }}
            />

            {/* Pink Orb - Bottom Left */}
            <div
                className="absolute w-80 h-80 md:w-[32rem] md:h-[32rem] rounded-full blur-3xl opacity-25"
                style={{
                    bottom: '10%',
                    left: '10%',
                    background: 'radial-gradient(circle, rgba(255, 0, 110, 0.35) 0%, rgba(255, 0, 110, 0.1) 50%, transparent 100%)',
                    animation: 'float 12s ease-in-out infinite',
                    animationDelay: '4s',
                }}
            />

            {/* Purple Orb - Middle Right */}
            <div
                className="absolute w-96 h-96 md:w-[36rem] md:h-[36rem] rounded-full blur-3xl opacity-25"
                style={{
                    top: '40%',
                    right: '15%',
                    background: 'radial-gradient(circle, rgba(139, 0, 255, 0.35) 0%, rgba(139, 0, 255, 0.1) 50%, transparent 100%)',
                    animation: 'float 9s ease-in-out infinite',
                    animationDelay: '1s',
                }}
            />

            {/* Pink Orb - Center */}
            <div
                className="absolute w-56 h-56 md:w-80 md:h-80 rounded-full blur-3xl opacity-20"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255, 0, 110, 0.3) 0%, rgba(255, 0, 110, 0.05) 50%, transparent 100%)',
                    animation: 'float 11s ease-in-out infinite',
                    animationDelay: '3s',
                }}
            />
        </div>
    )
}
