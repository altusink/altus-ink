import { useLocation } from "wouter";
import { SiWhatsapp } from "react-icons/si";

interface WhatsAppFloatProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppFloat({ 
  phoneNumber = "491234567890", 
  message = "Olá! Gostaria de saber mais sobre os serviços de tatuagem."
}: WhatsAppFloatProps) {
  const [location] = useLocation();

  const isDashboard = location.startsWith("/dashboard");
  if (isDashboard) return null;

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-6 z-40 bg-green-500 p-4 rounded-full shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200"
      data-testid="button-whatsapp-float"
      aria-label="Contact via WhatsApp"
    >
      <SiWhatsapp className="w-6 h-6 text-white" />
    </a>
  );
}
