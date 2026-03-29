export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCode } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    redirect("/dashboard/configuracoes?google=error");
  }

  try {
    const tokens = await exchangeCode(code!);

    await prisma.settings.update({
      where: { userId: session.user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleConnected: true,
      },
    });
  } catch {
    redirect("/dashboard/configuracoes?google=error");
  }

  redirect("/dashboard/configuracoes?google=success");
}
