export default function AuroraBackground() {
    return (
        <>
            {/* Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-layer-1" />
                <div className="aurora-layer-2" />
            </div>

            {/* Additional visible aurora waves */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute w-full h-full"
                    style={{
                        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(57, 255, 20, 0.15), transparent 50%)',
                        animation: 'pulse 8s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute w-full h-full"
                    style={{
                        background: 'radial-gradient(ellipse 70% 50% at 50% 120%, rgba(0, 245, 255, 0.15), transparent 50%)',
                        animation: 'pulse 10s ease-in-out infinite',
                        animationDelay: '2s',
                    }}
                />
            </div>
        </>
    )
}
