import { NextResponse } from "next/server";
import { getApiCtx } from "@/server/access";
import { db } from "@/server/db";

// « Partager vers Base Palmela » depuis Android → capture dans l'inbox.
export async function POST(req: Request) {
  const ctx = await getApiCtx();
  const base = process.env.APP_URL ?? new URL(req.url).origin;
  if (!ctx) return NextResponse.redirect(new URL("/login", base), 303);
  const form = await req.formData();
  const text = ["title", "text", "url"]
    .map((k) => form.get(k))
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .join("\n")
    .slice(0, 5000);
  if (text) await db.capture.create({ data: { userId: ctx.userId, rawText: text, source: "SHARE" } });
  return NextResponse.redirect(new URL("/inbox", base), 303);
}
