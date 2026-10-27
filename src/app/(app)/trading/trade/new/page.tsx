import { redirect } from "next/navigation";
import { PageHeader, Section } from "@/components/ui";
import { dbDate, timeInTz, todayISO } from "@/lib/dates";
import { EMOTION_LABEL } from "@/lib/labels";
import { getCtx } from "@/server/access";
import { createTrade } from "@/server/actions/trading";
import { db } from "@/server/db";
import { accountSnapshot } from "@/server/trading";

export const dynamic = "force-dynamic";

function Chips({ name, options, defaultValue }: { name: string; options: [string, string][]; defaultValue?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <label key={v} className="cursor-pointer">
          <input type="radio" name={name} value={v} defaultChecked={v === defaultValue} className="peer sr-only" />
          <span className="inline-flex min-h-[40px] items-center rounded-lg border border-line px-3 text-sm peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white">
            {l}
          </span>
        </label>
      ))}
    </div>
  );
}

export default async function NewTradePage({ searchParams }: { searchParams: { violation?: string } }) {
  const ctx = await getCtx();
  const today = todayISO();
  const session = await db.tradingSession.findUnique({ where: { userId_date: { userId: ctx.userId, date: dbDate(today) } } });
  if (!session?.checklistPassedAt) redirect("/trading/session");
  const violation = searchParams.violation === "1";
  if (session.lockedAt && !violation) redirect("/trading/session");

  const [accounts, setups] = await Promise.all([
    db.tradingAccount.findMany({
      where: { spaceId: ctx.personalSpaceId, status: "ACTIVE" },
      include: { trades: { where: { deletedAt: null } }, payouts: true, scalingTiers: true },
    }),
    db.tradeSetup.findMany({ where: { spaceId: ctx.personalSpaceId, active: true }, orderBy: { name: "asc" } }),
  ]);
  const fund = accounts.find((a) => a.isPersonalFund);
  const lot = fund ? accountSnapshot(fund).scaling?.current?.lotSize : null;

  return (
    <>
      <PageHeader title={violation ? "Trade hors règle" : "Nouveau trade"} back="/trading/session" />
      {violation && <p className="card mb-3 border-bad text-sm text-bad">Session verrouillée : ce trade sera marqué comme violation du plan.</p>}
      <form action={createTrade} encType="multipart/form-data">
        {violation && <input type="hidden" name="violation" value="on" />}
        <Section title="Comptes">
          {accounts.length === 0 && <p className="text-sm text-muted">Aucun compte actif.</p>}
          {accounts.map((a, i) => (
            <label key={a.id} className="flex min-h-[44px] items-center gap-3 text-[15px]">
              <input type="checkbox" name="accountIds" value={a.id} defaultChecked={i === 0} className="h-5 w-5" />
              {a.name}
            </label>
          ))}
          <p className="text-[11px] text-muted">Plusieurs comptes = trade copié (compte pour une seule perte).</p>
        </Section>

        <Section title="Exécution">
          <div className="space-y-3">
            <Chips name="instrument" options={[["MGC", "MGC"], ["XAUUSD", "XAUUSD"], ["GC", "GC"]]} defaultValue="MGC" />
            <Chips name="direction" options={[["LONG", "Long ↑"], ["SHORT", "Short ↓"]]} defaultValue="LONG" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Entrée (heure)</label>
                <input name="entryTime" type="time" className="input num" defaultValue={timeInTz(new Date())} required />
              </div>
              <div>
                <label className="label">Sortie (heure)</label>
                <input name="exitTime" type="time" className="input num" />
              </div>
              <div>
                <label className="label">Prix d&apos;entrée</label>
                <input name="entryPrice" className="input num" inputMode="decimal" required />
              </div>
              <div>
                <label className="label">Stop</label>
                <input name="stopPrice" className="input num" inputMode="decimal" />
              </div>
              <div>
                <label className="label">Objectif</label>
                <input name="targetPrice" className="input num" inputMode="decimal" />
              </div>
              <div>
                <label className="label">Prix de sortie</label>
                <input name="exitPrice" className="input num" inputMode="decimal" />
              </div>
              <div>
                <label className="label">Quantité (contrats / lots)</label>
                <input name="quantity" className="input num" inputMode="decimal" defaultValue={lot ?? 1} required />
              </div>
              <div>
                <label className="label">P&amp;L net (USD)</label>
                <input name="pnl" className="input num" inputMode="decimal" placeholder="-120 / 240" required />
              </div>
              <div>
                <label className="label">Frais</label>
                <input name="fees" className="input num" inputMode="decimal" />
              </div>
            </div>
            {lot != null && <p className="text-[11px] text-muted">Fonds perso : palier actuel {lot} lot.</p>}
            <p className="text-[11px] text-muted">Le R est calculé automatiquement si le stop est renseigné (MGC 10 $/pt, GC 100 $/pt, XAUUSD 100 $/pt par lot).</p>
          </div>
        </Section>

        <Section title="Contexte">
          <div className="space-y-3">
            <select name="setupId" className="input" defaultValue="">
              <option value="">Setup…</option>
              {setups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div>
              <div className="label">Émotion</div>
              <Chips name="emotion" options={Object.entries(EMOTION_LABEL)} />
            </div>
            <input name="emotionNote" className="input" placeholder="Note émotion (optionnel)" />
            <div>
              <div className="label">Plan respecté ?</div>
              <Chips name="followedPlan" options={[["yes", "Oui"], ["no", "Non"]]} />
            </div>
            <div>
              <label className="label">Capture</label>
              <input name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm" />
            </div>
            <textarea name="notes" className="input min-h-[70px] py-2" placeholder="Notes" />
          </div>
        </Section>

        <button className="btn mb-3 w-full">Enregistrer le trade</button>
      </form>
    </>
  );
}
