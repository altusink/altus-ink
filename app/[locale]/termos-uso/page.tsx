import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-bg-dark text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <h1 className="text-4xl font-heading font-bold mb-8">Termos de Uso</h1>
                <div className="space-y-6 text-text-secondary leading-relaxed">
                    <p>Última atualização: 19 de Dezembro de 2025</p>
                    <h2 className="text-2xl font-bold text-white mt-8">1. Aceitação</h2>
                    <p>
                        Ao agendar um serviço com a Altus Ink, você concorda com estes termos.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8">2. Agendamentos e Sinal</h2>
                    <p>
                        O pagamento do sinal (depósito) é obrigatório para confirmar qualquer sessão. O valor não é reembolsável em caso de cancelamento com menos de 7 dias de antecedência.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8">3. Menores de Idade</h2>
                    <p>
                        Não realizamos procedimentos em menores de 18 anos, independente de autorização dos pais. Documento com foto é exigido.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}
