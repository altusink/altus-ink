export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidade</h1>
      <div className="prose prose-invert max-w-none">
        <p>Sua privacidade é importante para nós. Esta política descreve como coletamos e usamos suas informações.</p>
        
        <h3>1. Coleta de Dados</h3>
        <p>Coletamos nome, telefone, email e informações de saúde estritamente necessárias para a segurança do procedimento de tatuagem.</p>

        <h3>2. Uso das Informações</h3>
        <p>Seus dados são usados apenas para:
           - Gerenciar seu agendamento.
           - Entrar em contato sobre sua sessão.
           - Garantir sua segurança durante o procedimento.
        </p>

        <h3>3. Compartilhamento</h3>
        <p>Não compartilhamos seus dados com terceiros, exceto quando exigido por lei.</p>

        <h3>4. Segurança</h3>
        <p>Utilizamos criptografia e protocolos de segurança para proteger suas informações pessoais.</p>
      </div>
    </div>
  );
}
