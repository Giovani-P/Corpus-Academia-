export const dynamic = "force-dynamic";

import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function POST() {
  await deleteSession();
  redirect("/login");
}
