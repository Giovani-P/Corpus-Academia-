export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { buildAuthUrl } from "@/lib/google-calendar";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await getSession();
  if (!session) redirect("/login");

  const url = buildAuthUrl();
  redirect(url);
}
