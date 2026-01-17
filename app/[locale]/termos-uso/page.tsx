import { useTranslations } from 'next-intl';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white mb-8">Termos de Uso</h1>
      <div className="prose prose-invert max-w-none">
        <p>Bem-vindo à Altus Ink. Ao agendar um serviço conosco, você concorda com os seguintes termos:</p>
        
        <h3>1. Agendamento e Sinal</h3>
        <p>Para confirmar sua reserva, é necessário o pagamento de um sinal não reembolsável (exceto conforme política de cancelamento). Este valor é descontado do preço final da tatuagem.</p>

        <h3>2. Cancelamento e Reagendamento</h3>
        <p>Cancelamentos com mais de 7 dias de antecedência: Reembolso integral.<br/>
           Entre 7 dias e 48h: Crédito para reagendamento.<br/>
           Menos de 48h: Perda do sinal.</p>

        <h3>3. Menores de Idade</h3>
        <p>É estritamente proibido tatuar menores de 18 anos, independente de autorização dos pais.</p>

        <h3>4. Saúde e Segurança</h3>
        <p>O cliente deve informar quaisquer condições médicas, alergias ou uso de medicamentos antes do procedimento.</p>
      </div>
    </div>
  );
}
