/**
 * Validação de variáveis de ambiente
 * Falha rápido se alguma variável obrigatória estiver faltando
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "SESSION_SECRET",
];

const optionalEnvVars = [
  "ANTHROPIC_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "WHATSAPP_VERIFY_TOKEN",
];

function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Variáveis de ambiente obrigatórias faltando:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\n📋 Configure o arquivo .env.local baseado em .env.example");
    process.exit(1);
  }

  // Warn para variáveis opcionais não configuradas em production
  if (process.env.NODE_ENV === "production") {
    const notConfigured = optionalEnvVars.filter((v) => !process.env[v]);
    if (notConfigured.length > 0) {
      console.warn("⚠️  Variáveis opcionais não configuradas em produção:");
      notConfigured.forEach((v) => console.warn(`   - ${v}`));
    }
  }
}

// Executar validação na inicialização
if (typeof window === "undefined") {
  // Server-side only
  validateEnv();
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "",
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
