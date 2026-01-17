# Altus Ink - Script de Configuração do Supabase
# Execute após criar o projeto no Supabase

Write-Host "🗄️  Altus Ink - Configuração Supabase" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Verificar se o arquivo schema.sql existe
if (!(Test-Path "lib/supabase/schema.sql")) {
    Write-Host "❌ Erro: Arquivo schema.sql não encontrado" -ForegroundColor Red
    Write-Host "   Certifique-se de estar na pasta altus-ink-v2" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 INSTRUÇÕES PARA CONFIGURAR SUPABASE:`n" -ForegroundColor Yellow

Write-Host "1. Criar Projeto Supabase:" -ForegroundColor Cyan
Write-Host "   - Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Clique em 'New Project'" -ForegroundColor White
Write-Host "   - Nome: altus-ink" -ForegroundColor White
Write-Host "   - Senha: (anote esta senha!)" -ForegroundColor White
Write-Host "   - Região: South America (São Paulo)" -ForegroundColor White
Write-Host "   - Aguarde ~2 minutos`n" -ForegroundColor White

Write-Host "2. Executar Schema SQL:" -ForegroundColor Cyan
Write-Host "   - No Supabase, vá em 'SQL Editor'" -ForegroundColor White
Write-Host "   - Clique em 'New query'" -ForegroundColor White
Write-Host "   - Cole o conteúdo de: lib/supabase/schema.sql" -ForegroundColor White
Write-Host "   - Clique em 'Run' (canto inferior direito)" -ForegroundColor White
Write-Host "   - Aguarde mensagem de sucesso`n" -ForegroundColor White

Write-Host "3. Obter Credenciais:" -ForegroundColor Cyan
Write-Host "   - Vá em Settings → API" -ForegroundColor White
Write-Host "   - Copie:" -ForegroundColor White
Write-Host "     * Project URL" -ForegroundColor White
Write-Host "     * anon public key" -ForegroundColor White
Write-Host "     * service_role key (⚠️  NUNCA compartilhe!)`n" -ForegroundColor White

Write-Host "4. Adicionar no Vercel:" -ForegroundColor Cyan
Write-Host "   - Vercel Dashboard → Seu Projeto" -ForegroundColor White
Write-Host "   - Settings → Environment Variables" -ForegroundColor White
Write-Host "   - Adicione:" -ForegroundColor White
Write-Host "     NEXT_PUBLIC_SUPABASE_URL=<Project URL>" -ForegroundColor White
Write-Host "     NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>" -ForegroundColor White
Write-Host "     SUPABASE_SERVICE_ROLE_KEY=<service_role key>`n" -ForegroundColor White

Write-Host "5. Redeploy:" -ForegroundColor Cyan
Write-Host "   - Deployments → ... → Redeploy`n" -ForegroundColor White

# Abrir arquivo schema.sql no notepad
Write-Host "📄 Abrindo schema.sql no Notepad..." -ForegroundColor Yellow
Start-Process notepad "lib/supabase/schema.sql"

Write-Host "`n✅ Copie o conteúdo do Notepad e cole no SQL Editor do Supabase!" -ForegroundColor Green
Write-Host "`n📖 Veja DEPLOY.md seção 'Configurar Supabase' para mais detalhes" -ForegroundColor Cyan
