# ✅ Checklist de Deploy - Altus Ink

Use este checklist para garantir que tudo está configurado corretamente antes do deploy.

## 📦 Arquivos do Projeto

- [x] `package.json` - Todas as dependências
- [x] `next.config.mjs` - Configuração Next.js
- [x] `tailwind.config.ts` - Design system
- [x] `.env.example` - Template de variáveis
- [x] `.gitignore` - Arquivos ignorados
- [x] `README.md` - Documentação
- [x] `DEPLOY.md` - Guia de deploy

## 🎨 Frontend

- [x] `app/layout.tsx` - Layout raiz
- [x] `app/page.tsx` - Landing page premium
- [x] `app/globals.css` - Estilos globais
- [x] `components/Navbar.tsx` - Navbar responsivo
- [x] `components/Footer.tsx` - Footer completo

## 🔧 Backend & APIs

- [x] `lib/supabase/client.ts` - Cliente Supabase (browser)
- [x] `lib/supabase/server.ts` - Cliente Supabase (server)
- [x] `lib/supabase/schema.sql` - Schema completo do banco
- [x] `lib/stripe/client.ts` - Cliente Stripe (browser)
- [x] `lib/stripe/server.ts` - Cliente Stripe (server)
- [x] `app/api/bookings/route.ts` - API de agendamentos
- [x] `app/api/artists/route.ts` - API de artistas
- [x] `app/api/webhooks/stripe/route.ts` - Webhook Stripe

## 🛠️ Utilitários

- [x] `lib/utils.ts` - Funções helper
- [x] `types/index.ts` - Tipos TypeScript

## 📋 Configurações Necessárias

### Antes do Deploy:

- [ ] Criar conta no Supabase
- [ ] Executar `schema.sql` no Supabase
- [ ] Obter credenciais Supabase (URL + Keys)
- [ ] Criar conta no Stripe
- [ ] Obter API keys do Stripe
- [ ] Criar conta no Resend
- [ ] Obter API key do Resend
- [ ] Criar conta no Vercel

### Durante o Deploy:

- [ ] Fazer deploy no Vercel
- [ ] Adicionar variáveis de ambiente
- [ ] Configurar webhook do Stripe
- [ ] Testar APIs

### Após o Deploy:

- [ ] Criar usuário CEO no Supabase Auth
- [ ] Adicionar artistas de teste
- [ ] Testar fluxo de agendamento
- [ ] Verificar confirmação de pagamento
- [ ] Configurar domínio customizado (opcional)

## 🧪 Testes Manuais

### Teste 1: Landing Page
- [ ] Acessar homepage
- [ ] Verificar todas as seções carregam
- [ ] Testar responsividade mobile
- [ ] Verificar animações funcionam

### Teste 2: API de Artistas
- [ ] GET `/api/artists` retorna array vazio ou artistas
- [ ] Criar artista no Supabase
- [ ] Verificar artista aparece na API

### Teste 3: API de Agendamentos
- [ ] POST `/api/bookings` com dados válidos
- [ ] Verificar retorna `bookingId` e `clientSecret`
- [ ] Verificar booking criado no Supabase
- [ ] Verificar Payment Intent criado no Stripe

### Teste 4: Webhook Stripe
- [ ] Simular pagamento bem-sucedido no Stripe Dashboard
- [ ] Verificar booking atualizado para `CONFIRMED`
- [ ] Verificar `deposit_paid = true`

## 🚨 Problemas Comuns

### Erro: "Module not found"
```bash
npm install --legacy-peer-deps
```

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Adicione variáveis de ambiente no Vercel
- Faça redeploy

### Erro: Build failed
- Verifique logs no Vercel
- Certifique-se que todas as dependências estão no `package.json`

### Erro: API retorna 500
- Verifique variáveis de ambiente
- Verifique logs do Supabase
- Verifique se schema SQL foi executado

## 📊 Métricas de Sucesso

Após deploy bem-sucedido, você deve ter:

- ✅ Site acessível em `https://seu-dominio.vercel.app`
- ✅ Landing page carregando em < 2s
- ✅ APIs respondendo corretamente
- ✅ Lighthouse score > 90
- ✅ Sem erros no console do navegador
- ✅ Sem erros nos logs do Vercel

## 🎯 Próximos Passos

Após deploy:

1. **Fase 2 - Crescimento:**
   - [ ] Implementar dashboards (CEO + Artista)
   - [ ] Sistema de emails com templates
   - [ ] WhatsApp integration
   - [ ] Analytics avançado
   - [ ] Programa de fidelidade

2. **Fase 3 - Premium:**
   - [ ] IA para orçamentos
   - [ ] Vouchers & Gift Cards
   - [ ] Flash Tattoos
   - [ ] Chat ao vivo
   - [ ] Multi-idioma completo

## 📞 Suporte

Se encontrar problemas:

1. Verifique este checklist
2. Consulte `DEPLOY.md`
3. Verifique logs:
   - Vercel: Dashboard → Deployments → Function Logs
   - Supabase: Database → Logs
   - Stripe: Developers → Logs

---

**Última atualização:** 2024-12-17
**Versão:** 2.0.0
**Status:** ✅ Pronto para Deploy
