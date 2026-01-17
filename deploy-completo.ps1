# Altus Ink - Deploy Completo Automatizado
# Este script executa TUDO em sequência

Write-Host "🚀 ALTUS INK - DEPLOY COMPLETO" -ForegroundColor Magenta
Write-Host "================================`n" -ForegroundColor Magenta

Write-Host "Este script vai:" -ForegroundColor Cyan
Write-Host "1. ✅ Verificar dependências" -ForegroundColor White
Write-Host "2. ✅ Instalar Vercel CLI" -ForegroundColor White
Write-Host "3. ✅ Fazer login no Vercel" -ForegroundColor White
Write-Host "4. ✅ Fazer deploy" -ForegroundColor White
Write-Host "5. ✅ Guiar configuração do Supabase" -ForegroundColor White
Write-Host "6. ✅ Guiar configuração do Stripe`n" -ForegroundColor White

$confirmation = Read-Host "Deseja continuar? (S/N)"
if ($confirmation -ne 'S' -and $confirmation -ne 's') {
    Write-Host "❌ Cancelado pelo usuário" -ForegroundColor Red
    exit 0
}

# ============================================
# PASSO 1: Verificações
# ============================================
Write-Host "`n📦 PASSO 1: Verificando dependências..." -ForegroundColor Yellow

if (!(Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute na pasta altus-ink-v2" -ForegroundColor Red
    exit 1
}

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# ============================================
# PASSO 2: Instalar Vercel CLI
# ============================================
Write-Host "`n📥 PASSO 2: Instalando Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel 2>$null
Write-Host "✅ Vercel CLI pronto" -ForegroundColor Green

# ============================================
# PASSO 3: Login Vercel
# ============================================
Write-Host "`n🔐 PASSO 3: Login no Vercel..." -ForegroundColor Yellow
Write-Host "   Seu navegador será aberto. Faça login e volte aqui.`n" -ForegroundColor Cyan

vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login falhou" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green

# ============================================
# PASSO 4: Deploy
# ============================================
Write-Host "`n🚀 PASSO 4: Fazendo deploy..." -ForegroundColor Yellow
Write-Host "   Responda as perguntas:`n" -ForegroundColor Cyan
Write-Host "   - Set up and deploy? → Y" -ForegroundColor White
Write-Host "   - Which scope? → (sua conta)" -ForegroundColor White
Write-Host "   - Link to existing project? → N" -ForegroundColor White
Write-Host "   - Project name? → altus-ink" -ForegroundColor White
Write-Host "   - Directory? → ./" -ForegroundColor White
Write-Host "   - Override settings? → N`n" -ForegroundColor White

vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy falhou" -ForegroundColor Red
    exit 1
}

$deployUrl = vercel --prod 2>&1 | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -First 1
Write-Host "`n✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 URL: $deployUrl`n" -ForegroundColor Cyan

# ============================================
# PASSO 5: Configurar Supabase
# ============================================
Write-Host "`n🗄️  PASSO 5: Configurar Supabase" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Write-Host "Abrindo instruções e schema.sql..." -ForegroundColor Cyan
Start-Process notepad "lib/supabase/schema.sql"
Start-Sleep -Seconds 2
Start-Process "https://supabase.com/dashboard"

Write-Host "`n📋 INSTRUÇÕES:" -ForegroundColor Cyan
Write-Host "1. No Supabase (que acabou de abrir):" -ForegroundColor White
Write-Host "   - Crie novo projeto: altus-ink" -ForegroundColor White
Write-Host "   - Aguarde 2 minutos" -ForegroundColor White
Write-Host "2. Vá em SQL Editor → New query" -ForegroundColor White
Write-Host "3. Cole o conteúdo do Notepad (schema.sql)" -ForegroundColor White
Write-Host "4. Clique em Run" -ForegroundColor White
Write-Host "5. Vá em Settings → API" -ForegroundColor White
Write-Host "6. Copie: Project URL, anon key, service_role key`n" -ForegroundColor White

Read-Host "Pressione ENTER quando terminar a configuração do Supabase"

# ============================================
# PASSO 6: Configurar Stripe
# ============================================
Write-Host "`n💳 PASSO 6: Configurar Stripe" -ForegroundColor Yellow
Write-Host "============================`n" -ForegroundColor Yellow

Start-Process "https://dashboard.stripe.com/register"

Write-Host "📋 INSTRUÇÕES:" -ForegroundColor Cyan
Write-Host "1. Crie conta no Stripe (que acabou de abrir)" -ForegroundColor White
Write-Host "2. NÃO ative ainda (use modo teste)" -ForegroundColor White
Write-Host "3. Vá em Developers → API keys" -ForegroundColor White
Write-Host "4. Copie: Publishable key e Secret key" -ForegroundColor White
Write-Host "5. Vá em Developers → Webhooks" -ForegroundColor White
Write-Host "6. Add endpoint: $deployUrl/api/webhooks/stripe" -ForegroundColor White
Write-Host "7. Events: payment_intent.succeeded, payment_intent.payment_failed" -ForegroundColor White
Write-Host "8. Copie o Signing secret`n" -ForegroundColor White

Read-Host "Pressione ENTER quando terminar a configuração do Stripe"

# ============================================
# PASSO 7: Adicionar Variáveis no Vercel
# ============================================
Write-Host "`n⚙️  PASSO 7: Adicionar Variáveis de Ambiente" -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Yellow

Start-Process "https://vercel.com/dashboard"

Write-Host "📋 No Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "1. Selecione o projeto 'altus-ink'" -ForegroundColor White
Write-Host "2. Settings → Environment Variables" -ForegroundColor White
Write-Host "3. Adicione TODAS as variáveis:`n" -ForegroundColor White

Write-Host "SUPABASE:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_URL=<cole aqui>" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<cole aqui>" -ForegroundColor White
Write-Host "  SUPABASE_SERVICE_ROLE_KEY=<cole aqui>`n" -ForegroundColor White

Write-Host "STRIPE:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<cole aqui>" -ForegroundColor White
Write-Host "  STRIPE_SECRET_KEY=<cole aqui>" -ForegroundColor White
Write-Host "  STRIPE_WEBHOOK_SECRET=<cole aqui>`n" -ForegroundColor White

Write-Host "APP:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_APP_URL=$deployUrl" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SITE_NAME=Altus Ink`n" -ForegroundColor White

Write-Host "4. Após adicionar, vá em Deployments" -ForegroundColor White
Write-Host "5. Clique nos ... do último deploy → Redeploy`n" -ForegroundColor White

Read-Host "Pressione ENTER quando terminar"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Host "`n🎉 DEPLOY COMPLETO!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

Write-Host "✅ Seu site está no ar em:" -ForegroundColor Cyan
Write-Host "   $deployUrl`n" -ForegroundColor White

Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Testar o site" -ForegroundColor White
Write-Host "2. Criar usuário CEO no Supabase Auth" -ForegroundColor White
Write-Host "3. Adicionar artistas" -ForegroundColor White
Write-Host "4. Testar agendamento`n" -ForegroundColor White

Write-Host "📖 Veja DEPLOY.md para mais detalhes!" -ForegroundColor Cyan
Write-Host "`n🚀 Parabéns! Altus Ink está online!" -ForegroundColor Magenta
