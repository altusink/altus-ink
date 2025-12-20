# 🚀 Guia Completo de Deploy - Altus Ink

Este guia contém todas as instruções para fazer deploy da plataforma Altus Ink no Vercel com Supabase e Stripe.

---

## 📋 Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com) (gratuita)
- [ ] Conta no [Supabase](https://supabase.com) (gratuita)
- [ ] Conta no [Stripe](https://stripe.com) (gratuita para testes)
- [ ] Conta no [Resend](https://resend.com) (gratuita até 3000 emails/mês)

---

## 1️⃣ Configurar Supabase

### Passo 1: Criar Projeto

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Preencha:
   - **Name:** altus-ink
   - **Database Password:** (anote essa senha!)
   - **Region:** Escolha o mais próximo (ex: South America)
4. Clique em "Create new project"
5. Aguarde ~2 minutos

### Passo 2: Executar Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie TODO o conteúdo do arquivo `lib/supabase/schema.sql`
4. Cole no editor
5. Clique em "Run" (canto inferior direito)
6. Aguarde mensagem de sucesso

### Passo 3: Obter Credenciais

1. Vá em **Settings** → **API**
2. Anote:
   - **Project URL** (ex: https://xxx.supabase.co)
   - **anon public** key
   - **service_role** key (⚠️ NUNCA compartilhe!)

---

## 2️⃣ Configurar Stripe

### Passo 1: Criar Conta

1. Acesse https://dashboard.stripe.com/register
2. Crie sua conta
3. **NÃO ative** ainda (use modo teste)

### Passo 2: Obter API Keys

1. No dashboard, vá em **Developers** → **API keys**
2. Anote:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### Passo 3: Configurar Webhook

1. Vá em **Developers** → **Webhooks**
2. Clique em "Add endpoint"
3. **Endpoint URL:** `https://SEU-DOMINIO.vercel.app/api/webhooks/stripe`
   - ⚠️ Você vai preencher isso DEPOIS do deploy
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Clique em "Add endpoint"
6. Anote o **Signing secret** (começa com `whsec_`)

### Passo 4: Ativar Métodos de Pagamento Europeus

1. Vá em **Settings** → **Payment methods**
2. Ative:
   - ✅ iDEAL (Holanda)
   - ✅ Bancontact (Bélgica)
   - ✅ SEPA Direct Debit
   - ✅ Multibanco (Portugal)

---

## 3️⃣ Configurar Resend

### Passo 1: Criar Conta

1. Acesse https://resend.com
2. Crie sua conta
3. Verifique seu email

### Passo 2: Obter API Key

1. No dashboard, vá em **API Keys**
2. Clique em "Create API Key"
3. **Name:** Altus Ink
4. **Permission:** Full access
5. Clique em "Add"
6. Anote a API key (começa com `re_`)

### Passo 3: Verificar Domínio (Opcional - para emails profissionais)

1. Vá em **Domains**
2. Clique em "Add Domain"
3. Digite seu domínio (ex: altusink.com)
4. Adicione os registros DNS fornecidos
5. Aguarde verificação

---

## 4️⃣ Deploy no Vercel

### Opção A: Via Interface Web (Recomendado)

1. Acesse https://vercel.com
2. Faça login
3. Clique em "Add New..." → "Project"
4. Importe do GitHub:
   - Se não tiver no GitHub, primeiro faça:
     ```bash
     cd C:\Users\Jander\Downloads\Ink-Canvas\altus-ink-v2
     git remote add origin https://github.com/SEU-USUARIO/altus-ink.git
     git branch -M main
     git push -u origin main
     ```
5. Selecione o repositório `altus-ink`
6. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### Opção B: Via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
cd C:\Users\Jander\Downloads\Ink-Canvas\altus-ink-v2
vercel

# 4. Responder:
# - Set up and deploy? Y
# - Which scope? (sua conta)
# - Link to existing project? N
# - Project name? altus-ink
# - Directory? ./
# - Override settings? N

# 5. Deploy para produção
vercel --prod
```

---

## 5️⃣ Configurar Variáveis de Ambiente no Vercel

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione TODAS as variáveis abaixo:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Resend
```
RESEND_API_KEY=re_...
```

### App
```
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_SITE_NAME=Altus Ink
```

3. Clique em "Save"
4. Vá em **Deployments**
5. Clique nos 3 pontinhos do último deploy → "Redeploy"

---

## 6️⃣ Atualizar Webhook do Stripe

1. Volte no Stripe Dashboard
2. **Developers** → **Webhooks**
3. Edite o endpoint criado anteriormente
4. Atualize a URL para: `https://SEU-DOMINIO.vercel.app/api/webhooks/stripe`
5. Salve

---

## 7️⃣ Testar a Aplicação

### Teste 1: Acessar o Site
1. Abra `https://seu-dominio.vercel.app`
2. Verifique se a landing page carrega

### Teste 2: Buscar Artistas
1. Abra: `https://seu-dominio.vercel.app/api/artists`
2. Deve retornar: `{"artists":[]}`

### Teste 3: Criar Artista de Teste (via Supabase)
1. No Supabase, vá em **Table Editor**
2. Selecione tabela `artists`
3. Clique em "Insert" → "Insert row"
4. Preencha:
   ```
   stage_name: João Ink
   bio: Especialista em realismo
   specialties: ["Realismo", "Blackwork"]
   hourly_rate: 100
   commission_rate: 0.60
   is_active: true
   ```
5. Salve

### Teste 4: Verificar Artista Aparece
1. Recarregue: `https://seu-dominio.vercel.app/api/artists`
2. Deve mostrar o artista criado

---

## 8️⃣ Configurar Domínio Customizado (Opcional)

### Se você tem altusink.com:

1. No Vercel, vá em **Settings** → **Domains**
2. Clique em "Add"
3. Digite: `altusink.com`
4. Vercel vai mostrar os registros DNS
5. No seu provedor de domínio (Namecheap, etc):
   - Adicione registro **A** apontando para o IP do Vercel
   - Adicione registro **CNAME** para www
6. Aguarde propagação (5min - 48h)

---

## 9️⃣ Próximos Passos

Após deploy bem-sucedido:

- [ ] Criar usuário CEO no Supabase Auth
- [ ] Adicionar artistas reais
- [ ] Upload de imagens para portfólio
- [ ] Testar fluxo de agendamento completo
- [ ] Configurar emails de confirmação
- [ ] Adicionar Google Analytics (opcional)

---

## 🆘 Troubleshooting

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifique se adicionou as variáveis de ambiente no Vercel
- Faça redeploy após adicionar

### Erro: "Stripe webhook signature verification failed"
- Verifique se o STRIPE_WEBHOOK_SECRET está correto
- Certifique-se que a URL do webhook no Stripe está correta

### Erro: "Failed to create booking"
- Verifique se o schema SQL foi executado corretamente
- Confira as RLS policies no Supabase

### Site não carrega
- Verifique os logs no Vercel: **Deployments** → Clique no deploy → **Function Logs**

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Vercel
2. Verifique os logs no Supabase (Database → Logs)
3. Teste as APIs individualmente

---

**Boa sorte com o deploy! 🚀**
