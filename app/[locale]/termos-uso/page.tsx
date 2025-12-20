import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default async function TermosUsoPage() {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen bg-bg-dark flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-24 text-white">
                    <h1 className="text-4xl font-bold font-heading mb-8 text-neon-green">Termos de Uso</h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
                            <p>Ao agendar um serviço com a Altus Ink, você concorda com estes termos. Se você não concordar, por favor, não prossiga com o agendamento.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Reservas e Sinais</h2>
                            <p>Para garantir seu horário, exigimos um sinal (depósito) não reembolsável. O valor será abatido do custo total da tatuagem no dia da sessão.</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>O sinal garante a exclusividade do artista para o horário reservado.</li>
                                <li>Em caso de não comparecimento (no-show), o sinal não será devolvido.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Cancelamentos e Remarcações</h2>
                            <p>Permitimos uma (1) remarcação sem custo adicional, desde que solicitada com pelo menos 48 horas de antecedência. Cancelamentos com menos de 48h implicam na perda do sinal.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Maioridade Legal</h2>
                            <p>Serviços de tatuagem são estritamente para maiores de 18 anos. É obrigatória a apresentação de documento oficial com foto no dia.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Propriedade Intelectual</h2>
                            <p>Os desenhos (flashs) e projetos criados pelos artistas são de propriedade intelectual dos mesmos. É proibida a reprodução sem autorização.</p>
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </NextIntlClientProvider>
    );
}
