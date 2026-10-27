import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getApiCtx } from "@/server/access";
import { db } from "@/server/db";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Captures de trades : servies uniquement à leur propriétaire.
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const ctx = await getApiCtx();
  if (!ctx) return new NextResponse("unauthorized", { status: 401 });
  const name = params.name;
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(name)) return new NextResponse("not found", { status: 404 });
  const owned = await db.trade.count({ where: { screenshotUrl: `/api/files/${name}`, account: { spaceId: ctx.personalSpaceId } } });
  if (!owned) return new NextResponse("not found", { status: 404 });
  try {
    const buf = await readFile(path.join(process.env.UPLOAD_DIR ?? "./uploads", name));
    return new NextResponse(buf, { headers: { "content-type": TYPES[name.split(".").pop()!], "cache-control": "private, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
