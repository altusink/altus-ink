# Altus Ink - Script de Deploy Automatizado
# Execute este script após fazer login no Vercel

Write-Host "🚀 Altus Ink - Deploy Automatizado" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Verificar se está na pasta correta
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta altus-ink-v2" -ForegroundColor Red
    exit 1
}

# Passo 1: Verificar instalações
Write-Host "📦 Verificando instalações..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red
    exit 1
}

# Passo 2: Instalar Vercel CLI
Write-Host "`n📥 Instalando Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Vercel CLI instalado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vercel CLI já instalado ou erro na instalação" -ForegroundColor Yellow
}

# Passo 3: Fazer login no Vercel
Write-Host "`n🔐 Fazendo login no Vercel..." -ForegroundColor Yellow
Write-Host "   Isso abrirá seu navegador. Faça login e volte aqui.`n" -ForegroundColor Cyan

vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login no Vercel falhou" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login no Vercel bem-sucedido!" -ForegroundColor Green

# Passo 4: Fazer deploy
Write-Host "`n🚀 Iniciando deploy..." -ForegroundColor Yellow
Write-Host "   Responda as perguntas do Vercel:`n" -ForegroundColor Cyan

vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy falhou" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green

# Passo 5: Próximos passos
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "1. Acesse o dashboard do Vercel:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/dashboard`n" -ForegroundColor White

Write-Host "2. Vá em Settings → Environment Variables" -ForegroundColor Yellow
Write-Host "   e adicione as seguintes variáveis:`n" -ForegroundColor White

Write-Host "   SUPABASE:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY`n" -ForegroundColor White

Write-Host "   STRIPE:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" -ForegroundColor White
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "   - STRIPE_WEBHOOK_SECRET`n" -ForegroundColor White

Write-Host "   RESEND:" -ForegroundColor Cyan
Write-Host "   - RESEND_API_KEY`n" -ForegroundColor White

Write-Host "   APP:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SITE_NAME=Altus Ink`n" -ForegroundColor White

Write-Host "3. Após adicionar as variáveis, faça redeploy:" -ForegroundColor Yellow
Write-Host "   Deployments → ... → Redeploy`n" -ForegroundColor White

Write-Host "4. Configure o Supabase:" -ForegroundColor Yellow
Write-Host "   - Crie projeto em https://supabase.com" -ForegroundColor White
Write-Host "   - Execute o SQL em lib/supabase/schema.sql`n" -ForegroundColor White

Write-Host "5. Configure o Stripe:" -ForegroundColor Yellow
Write-Host "   - Crie conta em https://stripe.com" -ForegroundColor White
Write-Host "   - Configure webhook apontando para:" -ForegroundColor White
Write-Host "     https://seu-dominio.vercel.app/api/webhooks/stripe`n" -ForegroundColor White

Write-Host "📖 Veja DEPLOY.md para instruções detalhadas!" -ForegroundColor Cyan
Write-Host "`n🎉 Parabéns! Seu projeto está no ar!" -ForegroundColor Green
