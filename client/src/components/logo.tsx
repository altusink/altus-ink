import altusLogo from "@assets/altus1_1765480827921.png";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  showText?: boolean;
}

const sizeClasses: Record<LogoSize, string> = {
  sm: "h-8 w-auto",      // 32px - compact for headers
  md: "h-10 w-auto",     // 40px - sidebar
  lg: "h-12 w-auto",     // 48px - navigation
  xl: "h-16 w-auto",     // 64px - hero sections
};

export function Logo({ size = "md", className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={altusLogo} 
        alt="Altus International Ink" 
        className={`${sizeClasses[size]} object-contain`}
        draggable={false}
      />
      {showText && (
        <span className="font-display font-bold tracking-tight text-foreground sr-only">
          Altus International Ink
        </span>
      )}
    </div>
  );
}

export function LogoCompact({ className = "" }: { className?: string }) {
  return (
    <img 
      src={altusLogo} 
      alt="Altus Ink" 
      className={`h-8 w-auto object-contain ${className}`}
      draggable={false}
    />
  );
}

export default Logo;
