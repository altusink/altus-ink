import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default async function PoliticaPrivacidadePage() {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen bg-bg-dark flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-24 text-white">
                    <h1 className="text-4xl font-bold font-heading mb-8 text-neon-blue">Política de Privacidade</h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Coleta de Dados</h2>
                            <p>Coletamos informações essenciais para o agendamento e segurança do procedimento, incluindo:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Nome, e-mail e telefone para contato.</li>
                                <li>Informações de saúde (alergias, condições médicas) para segurança do procedimento.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Uso das Informações</h2>
                            <p>Seus dados são usados exclusivamente para:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Gerenciar seu agendamento e enviar lembretes.</li>
                                <li>Garantir que o artista esteja ciente de qualquer condição de saúde relevante.</li>
                                <li>Processamento seguro de pagamentos (via Stripe/Pix).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Proteção de Dados</h2>
                            <p>Seus dados são armazenados em servidores seguros (Supabase) e não são compartilhados com terceiros para fins de marketing. Todos os pagamentos são processados por gateways certificados (PCI Compliant).</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Seus Direitos</h2>
                            <p>Você tem o direito de solicitar a exclusão dos seus dados a qualquer momento, exceto aqueles que somos obrigados a manter por lei (ex: registros fiscais).</p>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </NextIntlClientProvider>
    );
}
