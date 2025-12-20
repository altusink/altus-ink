import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'

export default async function PrivacyPage() {
    return (
        <div className="min-h-screen bg-bg-dark text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <h1 className="text-4xl font-heading font-bold mb-8">Política de Privacidade</h1>
                <div className="space-y-6 text-text-secondary leading-relaxed">
                    <p>Última atualização: 19 de Dezembro de 2025</p>
                    <p>
                        A Altus Ink ("nós", "nosso") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos e compartilhamos suas informações pessoais.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8">1. Coleta de Dados</h2>
                    <p>
                        Coletamos informações que você nos fornece diretamente, como nome, email, telefone e dados do formulário de saúde para fins de segurança no procedimento de tatuagem.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8">2. Uso das Informações</h2>
                    <p>
                        Utilizamos seus dados para processar agendamentos, enviar lembretes, processar pagamentos e garantir sua segurança durante os procedimentos.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8">3. Segurança</h2>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}
