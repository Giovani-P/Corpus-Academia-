# 🏋️ Corpus Academia — Painel de Gestão

Sistema inteligente de gestão, automação e IA para academias. Bot WhatsApp, leads, agendamentos, treinos com IA e integração Mercado Pago.

## 🚀 Início Rápido

### 1. Clonar e Instalar

```bash
git clone https://github.com/seu-usuario/corpus-academia.git
cd corpus-academia
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**
- `DATABASE_URL` — banco de dados (padrão: SQLite local)
- `SESSION_SECRET` — chave JWT (gere com: `openssl rand -base64 32`)

**Variáveis opcionais:**
- `ANTHROPIC_API_KEY` — Claude IA para gerar fichas de treino
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — integração Google Calendar
- `WHATSAPP_VERIFY_TOKEN` — webhook WhatsApp Cloud API

### 3. Inicializar Banco e Popular Dados

```bash
npm run db:push      # Criar schema
npm run db:seed      # Popular com dados de teste
```

**Credenciais de teste:**
- Email: `admin@corpusacademia.com.br`
- Senha: `corpus2025`
- ⚠️ **Troque a senha após o primeiro login!**

### 4. Iniciar Desenvolvimento

```bash
npm run dev
```

Acesse em **http://localhost:3000**

---

## 📋 Scripts Disponíveis

```bash
npm run dev          # Iniciar servidor desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor produção
npm run lint         # Validar código (ESLint)
npm run typecheck    # Verificar tipos TypeScript
npm run db:push      # Aplicar migrações Prisma
npm run db:seed      # Popular banco com dados de teste
npm run db:studio    # Abrir Prisma Studio (gerenciar dados)
```

---

## 🏗️ Arquitetura

### Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **UI:** Tailwind CSS + Radix UI
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** NextAuth v5 + bcryptjs
- **ORM:** Prisma
- **Pagamento:** Mercado Pago SDK v2
- **IA:** Anthropic Claude Haiku

### Estrutura de Pastas

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── dashboard/         # Painel administrativo (protegido)
│   ├── login/             # Página de login
│   └── api/               # API routes
├── components/
│   ├── ui/               # Componentes base (botões, inputs, etc)
│   ├── dashboard/        # Componentes do painel
│   └── ...
├── lib/
│   ├── prisma.ts         # Cliente Prisma
│   ├── session.ts        # Gerenciamento de sessão JWT
│   ├── env.ts            # Validação de env vars
│   └── mercadopago.ts    # Config Mercado Pago
├── middleware.ts          # Proteção de rotas (descontinuado, use layout)
└── prisma/
    ├── schema.prisma     # Modelo de dados
    └── seed.ts           # Dados de teste
```

---

## 📁 Funcionalidades

### ✅ Implementado (Fases 1-3)

#### Fase 1: Autenticação & Fundação
- [x] Login/Register com NextAuth + bcrypt
- [x] Workspace por usuário
- [x] Dashboard com estatísticas

#### Fase 2: Motor SaaS
- [x] Planos (Free/Starter/Pro/Enterprise)
- [x] Checkout com Mercado Pago
- [x] Webhook de pagamento → atualiza plano

#### Fase 3: Engine de Funis
- [x] Criação de funis de vendas
- [x] Blocos: Hero, CTA, Social Proof, FAQ, Testimonials, Form
- [x] Página pública `/p/[funnelSlug]/[pageSlug]`
- [x] Lead capture com tracking

### 🔄 Em Desenvolvimento (Fase 4)

- [ ] Gerador de vídeos virais com IA (academia/musculação/suplementos)
- [ ] Agente IA para sugestões de conteúdo
- [ ] Integração Instagram Reels/TikTok

---

## 🔐 Segurança

- **Env Vars:** Validação obrigatória em `lib/env.ts`
- **Banco:** Migrations versionadas em `prisma/migrations/`
- **Secrets:** `.env.local` ignorado no Git (veja `.gitignore`)
- **Sessão:** JWT com expiração 7 dias + HTTP-only cookies

---

## 📱 Variáveis de Ambiente

### Desenvolvimento (`.env.local`)

```env
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="seu-secret-muito-longo-aqui"
```

### Produção (Vercel / VPS)

Configure via Vercel Settings → Environment Variables ou `pm2 ecosystem.config.js`:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
SESSION_SECRET="<gerar com openssl rand -base64 32>"
NEXTAUTH_URL="https://seu-dominio.com"
```

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte repositório em [vercel.com](https://vercel.com)
3. Configure env vars em Settings
4. Deploy automático a cada push

### VPS (Hostinger / Linode)

```bash
# Clonar em VPS
git clone repo
cd corpus-academia
npm install
npm run build

# PM2 (opcional)
pm2 start npm --name corpus -- run start
pm2 save
```

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'prisma'"
```bash
npm install
npm run db:push
```

### Erro: "DATABASE_URL is required"
Certifique-se que `.env.local` existe com `DATABASE_URL` configurado.

### Erro: "Port 3000 is already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

### Seed falhou?
```bash
# Resetar banco
rm prisma/dev.db
npm run db:push
npm run db:seed
```

---

## 📚 Docs & Referências

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth Docs](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Mercado Pago API](https://developer.mercadopago.com/)

---

## 👤 Autor

**Giovani Pedroso** — Desenvolvedor Full Stack

---

## 📄 Licença

MIT — Use livremente em seus projetos!
