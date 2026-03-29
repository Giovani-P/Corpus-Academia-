import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp-client";

export interface AutomacaoResult {
  enviadas: number;
  ignoradas: number;
  erros: number;
  detalhes: string[];
}

/** Verifica se um log de automação já foi enviado recentemente */
export async function jaEnviouHoje(tipo: string, phone: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await prisma.automacaoLog.findFirst({
    where: { tipo, phone, sentAt: { gte: today } },
  });

  return !!log;
}

/** Verifica se já enviou esse tipo na janela de dias especificada */
export async function jaEnviouNosUltimosDias(
  tipo: string,
  phone: string,
  dias: number
): Promise<boolean> {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const log = await prisma.automacaoLog.findFirst({
    where: { tipo, phone, sentAt: { gte: desde } },
  });

  return !!log;
}

/** Registra envio no log */
export async function registrarEnvio(
  tipo: string,
  phone: string,
  alunoNome: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.automacaoLog.create({
    data: {
      tipo,
      phone,
      alunoNome,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/** Envia mensagem e registra no log */
export async function enviarERegistrar(
  phoneNumberId: string,
  accessToken: string,
  tipo: string,
  phone: string,
  nome: string,
  mensagem: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await sendWhatsappMessage(phoneNumberId, accessToken, phone, mensagem);
  await registrarEnvio(tipo, phone, nome, metadata);
}

/** Formata telefone para WhatsApp (adiciona 55 se necessário) */
export function formatPhoneForWA(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}
