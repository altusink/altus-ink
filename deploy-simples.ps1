# Altus Ink - Deploy Automatizado
# Execute este script para fazer deploy completo

Write-Host "ALTUS INK - DEPLOY AUTOMATIZADO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar pasta
if (!(Test-Path "package.json")) {
    Write-Host "ERRO: Execute na pasta altus-ink-v2" -ForegroundColor Red
    exit 1
}

# Instalar Vercel CLI
Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "Fazendo login no Vercel..." -ForegroundColor Yellow
Write-Host "Seu navegador sera aberto. Faca login e volte aqui." -ForegroundColor Cyan
Write-Host ""

vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Login falhou" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Login bem-sucedido!" -ForegroundColor Green
Write-Host ""
Write-Host "Fazendo deploy..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Responda as perguntas:" -ForegroundColor Cyan
Write-Host "- Set up and deploy? -> Y" -ForegroundColor White
Write-Host "- Which scope? -> (sua conta)" -ForegroundColor White
Write-Host "- Link to existing project? -> N" -ForegroundColor White
Write-Host "- Project name? -> altus-ink" -ForegroundColor White
Write-Host "- Directory? -> ./" -ForegroundColor White
Write-Host "- Override settings? -> N" -ForegroundColor White
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure Supabase:" -ForegroundColor Yellow
Write-Host "   - Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Crie projeto: altus-ink" -ForegroundColor White
Write-Host "   - Execute SQL em: lib/supabase/schema.sql" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure Stripe:" -ForegroundColor Yellow
Write-Host "   - Acesse: https://stripe.com" -ForegroundColor White
Write-Host "   - Obtenha API keys" -ForegroundColor White
Write-Host ""
Write-Host "3. Adicione variaveis no Vercel:" -ForegroundColor Yellow
Write-Host "   - Settings -> Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "Veja DEPLOY.md para instrucoes completas!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Parabens! Seu site esta no ar!" -ForegroundColor Green
