# 🚀 Corpus Academia - Primeiros Passos

## Para Você (Desenvolvedor)

### 1. **Instalar Dependências**
```bash
cd corpus-academia
npm install
```

### 2. **Configurar Banco de Dados Local**
```bash
# Criar/atualizar schema SQLite
npx prisma migrate dev

# Popular com dados de teste
npx prisma db seed
```

### 3. **Iniciar Servidor**
```bash
npm run dev
```

Acesse: **http://localhost:3000**

### **Credenciais de Teste**
- Email: `admin@corpusacademia.com.br`
- Senha: `corpus2025`

---

## Para o Dono da Academia (Produção)

A aplicação está deployada na Vercel:
**URL:** https://corpus-academia.vercel.app

### O que Fazer Agora:

#### 1. **Configurar Banco de Dados PostgreSQL**
- Criar uma conta em Supabase, Railway, ou similar
- Gerar connection string PostgreSQL
- Copiar para Vercel Settings → Environment Variables como `DATABASE_URL`

#### 2. **Configurar Credenciais de API**
Na Vercel Settings → Environment Variables, adicionar:

```env
# NextAuth
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
NEXTAUTH_URL=https://corpus-academia.vercel.app

# Claude AI (para gerar fichas de treinamento)
ANTHROPIC_API_KEY=<sua chave>

# Google OAuth (para integração com Google Calendar do Rafa)
GOOGLE_CLIENT_ID=<seu ID>
GOOGLE_CLIENT_SECRET=<seu secret>

# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=<seu token>
```

#### 3. **Fazer Migrate do Banco**
```bash
npx prisma db push
npx prisma db seed
```

---

## Status Atual

✅ **Código**: Completo e pronto
✅ **Vercel**: Deployado (awaiting database configuration)
⏳ **Banco de Dados**: TODO - Configure PostgreSQL em produção
⏳ **APIs**: TODO - Configure chaves de terceiros

---

## Próximas Fases

- **Fase 4**: Sistema de IA para gerar vídeos virais (academia/musculação/suplementos)
- **Fase 5**: Integrações avançadas (WhatsApp, Google Calendar, Mercado Pago)
- **Fase 6**: Dashboard administrativo completo

