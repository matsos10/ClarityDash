"use server";

import type { AccountType, Bias, DrawdownType, Emotion, Instrument, PayoutStatus, PropFirm } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbDate, todayISO, zonedTimeToUtc } from "@/lib/dates";
import { getCtx } from "../access";
import { db } from "../db";
import { POINT_VALUE, refreshAccountCache, refreshSessionLock } from "../trading";
import { bool, guard, int, num, oneOf, req, str } from "./form";

const FIRMS = ["TOPSTEP", "FUNDEDNEXT", "PERSONAL", "OTHER"] as const satisfies readonly PropFirm[];
const TYPES = ["EVALUATION", "FUNDED", "LIVE", "PERSONAL"] as const satisfies readonly AccountType[];
const DD = ["TRAILING_EOD", "TRAILING_INTRADAY", "STATIC"] as const satisfies readonly DrawdownType[];
const INSTRUMENTS = ["XAUUSD", "MGC", "GC", "OTHER"] as const satisfies readonly Instrument[];
const EMOTIONS = ["CALM", "CONFIDENT", "FOMO", "FEAR", "REVENGE", "BORED", "TIRED", "EUPHORIC"] as const satisfies readonly Emotion[];
const BIAS = ["BULLISH", "BEARISH", "NEUTRAL"] as const satisfies readonly Bias[];
const PAYOUT = ["PLANNED", "REQUESTED", "PAID", "REJECTED"] as const satisfies readonly PayoutStatus[];

async function accountForUser(id: string) {
  const ctx = await getCtx();
  const a = await db.tradingAccount.findFirst({ where: { id, spaceId: ctx.personalSpaceId } });
  if (!a) throw new Error("Compte introuvable");
  return a;
}

// ─── Comptes ───

export async function saveAccount(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const id = str(f, "id");
    const starting = num(f, "startingBalance");
    if (starting == null) throw new Error("Solde de départ requis");
    const data = {
      name: req(f, "name"),
      firm: oneOf(f, "firm", FIRMS),
      type: oneOf(f, "type", TYPES),
      status: oneOf(f, "status", ["ACTIVE", "BREACHED", "PASSED", "CLOSED"] as const, "ACTIVE"),
      currency: str(f, "currency") ?? "USD",
      startingBalance: starting,
      maxLossLimit: num(f, "maxLossLimit"),
      drawdownType: oneOf(f, "drawdownType", DD, "TRAILING_EOD"),
      mllLockBalance: num(f, "mllLockBalance"),
      dailyLossLimit: num(f, "dailyLossLimit"),
      consistencyPct: int(f, "consistencyPct"),
      payoutMinDays: int(f, "payoutMinDays"),
      payoutMinDayProfit: num(f, "payoutMinDayProfit"),
      profitSplitPct: int(f, "profitSplitPct"),
      isPersonalFund: bool(f, "isPersonalFund"),
      openedAt: dbDate(str(f, "openedAt") ?? todayISO()),
    };
    let accountId = id;
    if (id) {
      await accountForUser(id);
      await db.tradingAccount.update({ where: { id }, data });
    } else {
      const a = await db.tradingAccount.create({ data: { ...data, spaceId: ctx.personalSpaceId, balance: starting, highWaterMark: starting } });
      accountId = a.id;
    }
    await refreshAccountCache(accountId!);
    revalidatePath("/trading");
    redirect(`/trading/accounts/${accountId}`);
  });
}

export async function savePayout(f: FormData) {
  return guard(async () => {
    const a = await accountForUser(req(f, "accountId"));
    const id = str(f, "id");
    const status = oneOf(f, "status", PAYOUT, "REQUESTED");
    const date = str(f, "date") ?? todayISO();
    const at = zonedTimeToUtc(date, "12:00");
    if (id) {
      const p = await db.payout.findFirst({ where: { id, accountId: a.id } });
      if (!p) throw new Error("Payout introuvable");
      await db.payout.update({
        where: { id },
        data: { status, paidAt: status === "PAID" ? p.paidAt ?? at : null, requestedAt: p.requestedAt ?? at },
      });
    } else {
      const amount = num(f, "amount");
      if (!amount || amount <= 0) throw new Error("Montant requis");
      await db.payout.create({
        data: { accountId: a.id, amount, status, requestedAt: at, paidAt: status === "PAID" ? at : null, note: str(f, "note") },
      });
    }
    await refreshAccountCache(a.id);
    revalidatePath(`/trading/accounts/${a.id}`);
    revalidatePath("/trading");
  });
}

export async function saveScalingTier(f: FormData) {
  return guard(async () => {
    const a = await accountForUser(req(f, "accountId"));
    const capitalMin = num(f, "capitalMin");
    const lotSize = num(f, "lotSize");
    if (capitalMin == null || lotSize == null) throw new Error("Capital et lot requis");
    await db.scalingTier.create({
      data: {
        accountId: a.id,
        capitalMin,
        lotSize,
        label: str(f, "label") ?? `${lotSize} lot`,
        maxRiskPct: num(f, "maxRiskPct"),
        order: await db.scalingTier.count({ where: { accountId: a.id } }),
      },
    });
    revalidatePath(`/trading/accounts/${a.id}`);
  });
}

export async function deleteScalingTier(f: FormData) {
  return guard(async () => {
    const a = await accountForUser(req(f, "accountId"));
    await db.scalingTier.deleteMany({ where: { id: req(f, "id"), accountId: a.id } });
    revalidatePath(`/trading/accounts/${a.id}`);
  });
}

// ─── Session ───

export async function startSession(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const today = todayISO();
    const items = await db.preSessionChecklistItem.findMany({ where: { spaceId: ctx.personalSpaceId, active: true }, orderBy: { order: "asc" } });
    const checklist = items.map((i) => ({ itemId: i.id, label: i.label, required: i.required, checked: f.get(`item_${i.id}`) === "on" }));
    const missing = checklist.filter((c) => c.required && !c.checked);
    if (missing.length) throw new Error(`Check-list incomplète : ${missing.map((m) => m.label).join(", ")}`);
    const macro = await db.macroAnalysis.findFirst({ where: { spaceId: ctx.personalSpaceId, date: dbDate(today) } });
    const date = dbDate(today);
    await db.tradingSession.upsert({
      where: { userId_date: { userId: ctx.userId, date } },
      update: { checklist, checklistPassedAt: new Date(), macroAnalysisId: macro?.id },
      create: { userId: ctx.userId, date, checklist, checklistPassedAt: new Date(), macroAnalysisId: macro?.id },
    });
    revalidatePath("/trading");
    revalidatePath("/today");
    redirect("/trading/session");
  });
}

// ─── Trades ───

async function saveScreenshot(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error("Capture trop lourde (8 Mo max)");
  const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[file.type];
  if (!ext) throw new Error("Format de capture non supporté");
  const dir = process.env.UPLOAD_DIR ?? "./uploads";
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/api/files/${name}`;
}

export async function createTrade(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const today = todayISO();
    const session = await db.tradingSession.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(today) } } });
    if (!session?.checklistPassedAt) throw new Error("Check-list pré-session requise avant tout trade");
    const violation = bool(f, "violation");
    if (session.lockedAt && !violation) throw new Error("Session verrouillée : 2 pertes atteintes");

    const accountIds = f.getAll("accountIds").map(String);
    if (!accountIds.length) throw new Error("Choisis au moins un compte");
    const accounts = await db.tradingAccount.findMany({ where: { id: { in: accountIds }, spaceId: ctx.personalSpaceId } });
    if (accounts.length !== accountIds.length) throw new Error("Compte invalide");

    const instrument = oneOf(f, "instrument", INSTRUMENTS);
    const entryPrice = num(f, "entryPrice");
    const pnl = num(f, "pnl");
    const quantity = num(f, "quantity");
    if (entryPrice == null || pnl == null || !quantity) throw new Error("Entrée, quantité et P&L requis");
    const stopPrice = num(f, "stopPrice");
    const riskAmount = stopPrice != null ? Math.abs(entryPrice - stopPrice) * quantity * POINT_VALUE[instrument] : null;
    const rMultiple = riskAmount ? Math.round((pnl / riskAmount) * 100) / 100 : null;
    const entryTime = req(f, "entryTime");
    const exitTime = str(f, "exitTime");
    const setupId = str(f, "setupId");
    if (setupId && !(await db.tradeSetup.count({ where: { id: setupId, spaceId: ctx.personalSpaceId } }))) throw new Error("Setup invalide");

    const screenshotUrl = await saveScreenshot(f.get("screenshot"));
    const copyGroupId = accounts.length > 1 ? randomUUID() : null;
    const notes = [violation && session.lockedAt ? "⚠ Trade pris malgré le verrou (violation)" : null, str(f, "notes")].filter(Boolean).join("\n") || null;

    await db.trade.createMany({
      data: accounts.map((a) => ({
        accountId: a.id,
        sessionId: session.id,
        setupId,
        copyGroupId,
        instrument,
        direction: oneOf(f, "direction", ["LONG", "SHORT"] as const),
        entryAt: zonedTimeToUtc(today, entryTime),
        exitAt: exitTime ? zonedTimeToUtc(today, exitTime) : null,
        entryPrice,
        exitPrice: num(f, "exitPrice"),
        stopPrice,
        targetPrice: num(f, "targetPrice"),
        quantity,
        pnl,
        fees: num(f, "fees") ?? 0,
        riskAmount,
        rMultiple,
        emotion: str(f, "emotion") ? oneOf(f, "emotion", EMOTIONS) : null,
        emotionNote: str(f, "emotionNote"),
        followedPlan: violation && session.lockedAt ? false : str(f, "followedPlan") ? f.get("followedPlan") === "yes" : null,
        screenshotUrl,
        notes,
      })),
    });
    await refreshSessionLock(session.id);
    for (const a of accounts) await refreshAccountCache(a.id);
    revalidatePath("/trading");
    revalidatePath("/today");
    redirect("/trading/session");
  });
}

export async function deleteTrade(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const ids = f.getAll("id").map(String);
    const trades = await db.trade.findMany({ where: { id: { in: ids }, account: { spaceId: ctx.personalSpaceId } } });
    if (!trades.length) throw new Error("Trade introuvable");
    await db.trade.updateMany({ where: { id: { in: trades.map((t) => t.id) } }, data: { deletedAt: new Date() } });
    for (const sessionId of new Set(trades.map((t) => t.sessionId).filter((x): x is string => !!x))) await refreshSessionLock(sessionId);
    for (const accountId of new Set(trades.map((t) => t.accountId))) {
      await refreshAccountCache(accountId);
      revalidatePath(`/trading/accounts/${accountId}`);
    }
    revalidatePath("/trading");
    revalidatePath("/trading/session");
  });
}

// ─── Check-list & setups ───

export async function addChecklistItem(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await db.preSessionChecklistItem.create({
      data: { spaceId: ctx.personalSpaceId, label: req(f, "label"), required: bool(f, "required"), order: await db.preSessionChecklistItem.count({ where: { spaceId: ctx.personalSpaceId } }) },
    });
    revalidatePath("/trading/config");
  });
}

export async function toggleChecklistItem(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const item = await db.preSessionChecklistItem.findFirst({ where: { id: req(f, "id"), spaceId: ctx.personalSpaceId } });
    if (!item) throw new Error("Élément introuvable");
    await db.preSessionChecklistItem.update({ where: { id: item.id }, data: { active: !item.active } });
    revalidatePath("/trading/config");
  });
}

export async function addSetup(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    await db.tradeSetup.create({ data: { spaceId: ctx.personalSpaceId, name: req(f, "name"), description: str(f, "description") } });
    revalidatePath("/trading/config");
  });
}

export async function toggleSetup(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const s = await db.tradeSetup.findFirst({ where: { id: req(f, "id"), spaceId: ctx.personalSpaceId } });
    if (!s) throw new Error("Setup introuvable");
    await db.tradeSetup.update({ where: { id: s.id }, data: { active: !s.active } });
    revalidatePath("/trading/config");
  });
}

// ─── Analyse macro (6 sections) ───

export async function saveMacro(f: FormData) {
  return guard(async () => {
    const ctx = await getCtx();
    const date = str(f, "date") ?? todayISO();
    const instrument = oneOf(f, "instrument", INSTRUMENTS, "XAUUSD");
    const score = int(f, "score") ?? 0;
    if (score < -10 || score > 10) throw new Error("Score entre -10 et +10");

    const news = [0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => ({
        event: str(f, `news_event_${i}`),
        actual: str(f, `news_actual_${i}`),
        forecast: str(f, `news_forecast_${i}`),
        previous: str(f, `news_previous_${i}`),
        impact: int(f, `news_impact_${i}`) ?? 0,
      }))
      .filter((x) => x.event);
    const split = (k: string) => (str(f, k) ?? "").split(/[;\n]/).map((s) => s.trim()).filter(Boolean);
    const scenarios = [0, 1, 2]
      .map((i) => ({
        order: i,
        label: str(f, `sc_label_${i}`),
        probability: int(f, `sc_prob_${i}`) ?? 0,
        trigger: str(f, `sc_trigger_${i}`) ?? "",
        target: str(f, `sc_target_${i}`),
        invalidation: str(f, `sc_invalid_${i}`),
      }))
      .filter((s): s is typeof s & { label: string } => !!s.label);
    const totalProb = scenarios.reduce((a, s) => a + s.probability, 0);
    if (scenarios.length && totalProb !== 100) throw new Error(`Les probabilités des scénarios doivent faire 100 % (actuel : ${totalProb} %)`);

    const data = {
      newsImpact: news,
      score,
      bias: oneOf(f, "bias", BIAS),
      levels: { resistances: split("resistances"), supports: split("supports"), pivot: str(f, "pivot") },
      causalChain: req(f, "causalChain"),
      mainCatalyst: req(f, "mainCatalyst"),
    };
    const key = { spaceId_date_instrument: { spaceId: ctx.personalSpaceId, date: dbDate(date), instrument } };
    const analysis = await db.macroAnalysis.upsert({ where: key, update: data, create: { ...data, spaceId: ctx.personalSpaceId, date: dbDate(date), instrument } });
    await db.$transaction([
      db.macroScenario.deleteMany({ where: { analysisId: analysis.id } }),
      db.macroScenario.createMany({ data: scenarios.map((s) => ({ ...s, analysisId: analysis.id })) }),
    ]);
    // la routine « Analyse macro » est cochée automatiquement
    const routine = await db.routineItem.findFirst({ where: { userId: ctx.userId, active: true, title: { contains: "macro", mode: "insensitive" } } });
    if (routine && date === todayISO()) {
      await db.routineCheck.upsert({ where: { itemId_date: { itemId: routine.id, date: dbDate(date) } }, update: {}, create: { itemId: routine.id, date: dbDate(date) } });
    }
    revalidatePath("/trading/macro");
    redirect(`/trading/macro?d=${date}`);
  });
}
