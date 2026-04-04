export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Webhook do Mercado Pago envia: { action, data: { id } }
    if (body.action !== "payment.created" && body.action !== "payment.updated") {
      return NextResponse.json({ status: "ok" });
    }

    const mpPaymentId = body.data?.id;
    if (!mpPaymentId) {
      return NextResponse.json({ status: "ok" });
    }

    // Buscar sessão de checkout
    const session = await prisma.checkoutSession.findFirst({
      where: { mercadopagoId: mpPaymentId },
    });

    if (!session) {
      return NextResponse.json({ status: "ok" });
    }

    // Aqui você faria uma chamada à API do Mercado Pago para confirmar o status
    // Por enquanto, apenas registramos que o webhook foi recebido
    // Em produção, você faria:
    // const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    //   headers: { Authorization: `Bearer ${accessToken}` }
    // });
    // const payment = await mpResponse.json();
    // if (payment.status === "approved") { ... }

    // Assumindo que o pagamento foi aprovado (ideal seria verificar com o MP)
    if (body.action === "payment.updated") {
      await prisma.checkoutSession.update({
        where: { id: session.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      // Enviar confirmação via WhatsApp
      const settings = await prisma.settings.findFirst();
      if (settings?.whatsappAccessToken && settings.whatsappPhoneNumberId) {
        const msg =
          `🎉 *Bem-vindo à Academia Corpus!*\n\n` +
          `Seu pagamento foi confirmado! ✅\n` +
          `Plano: ${session.plano}\n` +
          `Valor: R$ ${session.valor.toFixed(2)}\n\n` +
          `Você já pode acessar a plataforma.\n` +
          `Dúvidas? Estamos aqui para ajudar! 💪`;

        await sendWhatsappMessage(
          settings.whatsappPhoneNumberId,
          settings.whatsappAccessToken,
          session.phone,
          msg
        ).catch(() => null);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ status: "ok" });
  }
}
