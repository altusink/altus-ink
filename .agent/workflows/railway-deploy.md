# Deploy no Railway - Altus Ink

---
description: Passo a passo para deploy do Altus Ink no Railway
---

## Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Projeto commitado e pushed

---

## Passo 1: Fazer Push do Código para o GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## Passo 2: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu repositório
5. Selecione o repositório **Ink-Canvas**

---

## Passo 3: Adicionar PostgreSQL

1. No projeto criado, clique em **"+ New"** (canto superior direito)
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. O Railway criará automaticamente a variável `DATABASE_URL`

---

## Passo 4: Configurar Variáveis de Ambiente

1. Clique no serviço da sua aplicação (não o banco de dados)
2. Vá na aba **"Variables"**
3. Adicione as seguintes variáveis:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `SESSION_SECRET` | (gere um valor aleatório de 32+ caracteres) | ✅ Sim |
| `NODE_ENV` | `production` | ✅ Sim |
| `DATABASE_URL` | (já preenchido automaticamente pelo Railway) | ✅ Sim |
| `STRIPE_SECRET_KEY` | Sua chave API do Stripe | ⚠️ Para pagamentos |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | ⚠️ Para pagamentos |
| `SMTP_HOST` | Ex: `smtp.gmail.com` | ⚠️ Para emails |
| `SMTP_PORT` | Ex: `587` | ⚠️ Para emails |
| `SMTP_USER` | Seu email | ⚠️ Para emails |
| `SMTP_PASSWORD` | Senha do app | ⚠️ Para emails |
| `ZAPI_INSTANCE_ID` | ID da instância Z-API | ⚠️ Para WhatsApp |
| `ZAPI_TOKEN` | Token Z-API | ⚠️ Para WhatsApp |

> 💡 **Dica**: Para gerar SESSION_SECRET, use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Passo 5: Configurar Domínio

1. No serviço da aplicação, vá na aba **"Settings"**
2. Role até **"Networking"** → **"Public Networking"**
3. Clique em **"Generate Domain"** para obter um domínio `.railway.app`
4. Ou configure um domínio personalizado

---

## Passo 6: Deploy

O Railway deve fazer deploy automaticamente após:
- Configurar as variáveis
- Detectar o `railway.toml` ou `Dockerfile`

Se não iniciar automaticamente:
1. Vá na aba **"Deployments"**
2. Clique em **"Deploy"** ou **"Redeploy"**

---

## Passo 7: Executar Migrations do Banco

Após o primeiro deploy:

1. No Railway, clique no serviço da aplicação
2. Vá na aba **"Variables"**
3. Copie o valor de `DATABASE_URL`
4. No seu terminal local, execute:

```bash
DATABASE_URL="cole_a_url_aqui" npx drizzle-kit push
```

Ou, para fazer via Railway Shell:
1. Clique no serviço → aba **"Shell"**
2. Execute: `npx drizzle-kit push`

---

## Passo 8: Verificar Deploy

1. Acesse o domínio gerado (ex: `altusink-production.up.railway.app`)
2. Verifique o health check: `https://seu-dominio/health`
3. Deve retornar: `{"status":"healthy",...}`

---

## Troubleshooting

### Build falhou
- Verifique os logs na aba **"Deployments"** → clique no deploy → **"Build Logs"**
- Erros comuns: dependências faltando, TypeScript errors

### App não inicia
- Verifique **"Deploy Logs"**
- Confirme que `DATABASE_URL` está configurado
- Confirme que `SESSION_SECRET` foi definido

### Health check falhando
- A rota `/health` deve estar acessível
- Verifique se a porta 5000 está correta (Railway usa $PORT)

---

## Comandos Úteis (Terminal Local)

```bash
# Verificar se o build funciona localmente
npm run build

# Testar produção localmente
npm run start

# Verificar Docker localmente
docker build -t altusink .
docker run -p 5000:5000 altusink
```
