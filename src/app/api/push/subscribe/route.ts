import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiCtx } from "@/server/access";
import { db } from "@/server/db";
import { sendPush } from "@/server/push";

const sub = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) });

export async function POST(req: Request) {
  const ctx = await getApiCtx();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const p = sub.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const data = { userId: ctx.userId, p256dh: p.data.keys.p256dh, auth: p.data.keys.auth, userAgent: req.headers.get("user-agent") };
  await db.pushSubscription.upsert({ where: { endpoint: p.data.endpoint }, update: data, create: { ...data, endpoint: p.data.endpoint } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const ctx = await getApiCtx();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (body.endpoint) await db.pushSubscription.deleteMany({ where: { endpoint: body.endpoint, userId: ctx.userId } });
  return NextResponse.json({ ok: true });
}

export async function PUT() {
  const ctx = await getApiCtx();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sent = await sendPush(ctx.userId, { title: "Base Palmela", body: "Notifications actives ✓", url: "/today" });
  return NextResponse.json({ sent });
}
