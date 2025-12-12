import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
    title: string;
    children: React.ReactNode;
}

function LegalPageLayout({ title, children }: LegalPageProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <Link href="/">
                        <img src="/logo-altus.png" alt="Altus Ink" className="h-8 w-auto" />
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
                    <div className="prose prose-invert prose-zinc max-w-none">
                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

export function PrivacyPage() {
    return (
        <LegalPageLayout title="Política de Privacidade">
            <p className="text-zinc-400 text-lg mb-6">
                Última atualização: Dezembro 2024
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Informações que Coletamos</h2>
            <p className="text-zinc-300 mb-4">
                Coletamos informações que você nos fornece diretamente, incluindo:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li>Nome e informações de contato (email, telefone)</li>
                <li>Dados de pagamento (processados de forma segura via Stripe)</li>
                <li>Preferências de tatuagem e referências de imagem</li>
                <li>Comunicações com artistas</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Como Usamos Suas Informações</h2>
            <p className="text-zinc-300 mb-4">
                Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li>Processar e confirmar agendamentos</li>
                <li>Facilitar pagamentos e depósitos</li>
                <li>Comunicar atualizações sobre seus agendamentos</li>
                <li>Melhorar nossa plataforma e serviços</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Compartilhamento de Dados</h2>
            <p className="text-zinc-300 mb-6">
                Compartilhamos suas informações apenas com artistas relevantes para completar seu agendamento
                e com processadores de pagamento seguros. Nunca vendemos seus dados.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Seus Direitos (GDPR)</h2>
            <p className="text-zinc-300 mb-4">
                Você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li>Acessar seus dados pessoais</li>
                <li>Retificar informações incorretas</li>
                <li>Solicitar exclusão de seus dados</li>
                <li>Exportar seus dados (portabilidade)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contato</h2>
            <p className="text-zinc-300">
                Para questões sobre privacidade: <a href="mailto:privacy@altusink.io" className="text-gold hover:underline">privacy@altusink.io</a>
            </p>
        </LegalPageLayout>
    );
}

export function TermsPage() {
    return (
        <LegalPageLayout title="Termos de Serviço">
            <p className="text-zinc-400 text-lg mb-6">
                Última atualização: Dezembro 2024
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-zinc-300 mb-6">
                Ao usar a plataforma ALTUS INK, você concorda com estes termos de serviço.
                Se não concordar, não utilize nossos serviços.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Serviços Oferecidos</h2>
            <p className="text-zinc-300 mb-6">
                ALTUS INK é uma plataforma de agendamento que conecta clientes a tatuadores profissionais.
                Não somos responsáveis pelo trabalho artístico realizado pelos tatuadores.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Pagamentos e Depósitos</h2>
            <p className="text-zinc-300 mb-4">
                Ao agendar, você concorda em:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li>Pagar um depósito não-reembolsável para confirmar o agendamento</li>
                <li>Depósitos são deduzidos do valor total da sessão</li>
                <li>Cancelamentos podem estar sujeitos a políticas específicas do artista</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Responsabilidades do Usuário</h2>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li>Fornecer informações precisas</li>
                <li>Comparecer no horário agendado</li>
                <li>Seguir instruções de cuidados pós-tatuagem</li>
                <li>Informar condições de saúde relevantes</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Limitação de Responsabilidade</h2>
            <p className="text-zinc-300 mb-6">
                ALTUS INK não é responsável por resultados artísticos, reações alérgicas ou complicações
                de saúde. Cada artista é um profissional independente.
            </p>
        </LegalPageLayout>
    );
}

export function CancellationPage() {
    return (
        <LegalPageLayout title="Política de Cancelamento">
            <p className="text-zinc-400 text-lg mb-6">
                Entendemos que imprevistos acontecem. Aqui está nossa política de cancelamento.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Depósitos</h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                <p className="text-neon-cyan font-semibold mb-2">⚠️ Depósitos não são reembolsáveis</p>
                <p className="text-zinc-300">
                    O depósito garante seu horário e cobre o tempo de preparação do artista.
                    Em caso de cancelamento, o depósito não será devolvido.
                </p>
            </div>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Reagendamento</h2>
            <p className="text-zinc-300 mb-4">
                Você pode reagendar sua sessão sob as seguintes condições:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-6">
                <li><strong className="text-white">Até 72 horas antes:</strong> Reagendamento gratuito (1x)</li>
                <li><strong className="text-white">24-72 horas antes:</strong> Reagendamento com taxa adicional de 20%</li>
                <li><strong className="text-white">Menos de 24 horas:</strong> Perda total do depósito</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. No-Show</h2>
            <p className="text-zinc-300 mb-6">
                Não comparecer sem aviso prévio resulta em perda total do depósito e
                possível bloqueio para futuros agendamentos na plataforma.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Cancelamento pelo Artista</h2>
            <p className="text-zinc-300 mb-6">
                Se o artista cancelar a sessão, você receberá reembolso integral do depósito
                ou poderá optar por reagendamento com prioridade.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Emergências</h2>
            <p className="text-zinc-300">
                Emergências médicas documentadas podem ser elegíveis para reembolso parcial.
                Entre em contato: <a href="mailto:support@altusink.io" className="text-gold hover:underline">support@altusink.io</a>
            </p>
        </LegalPageLayout>
    );
}

export function CookiesPage() {
    return (
        <LegalPageLayout title="Política de Cookies">
            <p className="text-zinc-400 text-lg mb-6">
                Este site usa cookies para melhorar sua experiência.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. O que são Cookies?</h2>
            <p className="text-zinc-300 mb-6">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam
                a lembrar suas preferências e melhorar nossa plataforma.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Cookies que Usamos</h2>
            <div className="space-y-4 mb-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">🔒 Essenciais</h3>
                    <p className="text-zinc-300 text-sm">
                        Necessários para login e segurança. Não podem ser desativados.
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">📊 Analytics</h3>
                    <p className="text-zinc-300 text-sm">
                        Nos ajudam a entender como você usa a plataforma para melhorias.
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">🎨 Preferências</h3>
                    <p className="text-zinc-300 text-sm">
                        Lembram configurações como idioma e tema preferido.
                    </p>
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Gerenciar Cookies</h2>
            <p className="text-zinc-300 mb-6">
                Você pode gerenciar cookies através das configurações do seu navegador.
                Note que desativar alguns cookies pode afetar a funcionalidade do site.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Mais Informações</h2>
            <p className="text-zinc-300">
                Dúvidas sobre cookies? <a href="mailto:privacy@altusink.io" className="text-gold hover:underline">privacy@altusink.io</a>
            </p>
        </LegalPageLayout>
    );
}
