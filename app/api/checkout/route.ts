export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLANOS = {
  MENSAL: { preco: 79.9, nome: "Mensal" },
  TRIMESTRAL: { preco: 199.9, nome: "Trimestral (3 meses)" },
  ANUAL: { preco: 699.9, nome: "Anual (12 meses)" },
} as const;

export async function POST(req: NextRequest) {
  const { plano, nome, email, telefone } = await req.json();

  if (!plano || !nome || !email || !telefone) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes" },
      { status: 400 }
    );
  }

  if (!(plano in PLANOS)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const planInfo = PLANOS[plano as keyof typeof PLANOS];
  const settings = await prisma.settings.findFirst();

  if (!settings?.mercadopagoAccessToken) {
    return NextResponse.json(
      { error: "Mercado Pago não configurado" },
      { status: 500 }
    );
  }

  try {
    // Criar preferência no Mercado Pago
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.mercadopagoAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: `Academia Corpus - ${planInfo.nome}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: planInfo.preco,
            },
          ],
          payer: {
            name,
            email,
            phone: { area_code: "11", number: telefone.replace(/\D/g, "") },
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/failure`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`,
          },
          auto_return: "approved",
          notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Mercado Pago error: ${await response.text()}`);
    }

    const mpData = await response.json();

    // Salvar sessão de checkout no banco
    await prisma.checkoutSession.create({
      data: {
        mercadopagoId: mpData.id,
        phone: telefone.replace(/\D/g, ""),
        email,
        nome,
        plano,
        valor: planInfo.preco,
        mercadopagoData: JSON.stringify(mpData),
      },
    });

    return NextResponse.json({
      success: true,
      init_point: mpData.init_point,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Erro ao processar checkout" },
      { status: 500 }
    );
  }
}
