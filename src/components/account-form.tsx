import type { TradingAccount } from "@prisma/client";
import { isoFromDb, todayISO } from "@/lib/dates";
import { saveAccount } from "@/server/actions/trading";

const v = (x: unknown) => (x == null ? "" : String(x));

function F({ label, name, def, hint }: { label: string; name: string; def?: string; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input name={name} className="input num" inputMode="decimal" defaultValue={def} placeholder={hint} />
    </div>
  );
}

/** Règles réglables par compte (Topstep XFA : MLL trailing EOD figé au solde de départ, consistance 40 %, 3 jours). */
export function AccountForm({ a }: { a?: TradingAccount }) {
  return (
    <form action={saveAccount} className="space-y-3">
      {a && <input type="hidden" name="id" value={a.id} />}
      <input name="name" className="input" placeholder="Ex. Topstep XFA 50K #1" defaultValue={a?.name} required />
      <div className="grid grid-cols-2 gap-2">
        <select name="firm" className="input" defaultValue={a?.firm ?? "TOPSTEP"}>
          <option value="TOPSTEP">Topstep</option>
          <option value="FUNDEDNEXT">FundedNext</option>
          <option value="PERSONAL">Fonds perso</option>
          <option value="OTHER">Autre</option>
        </select>
        <select name="type" className="input" defaultValue={a?.type ?? "FUNDED"}>
          <option value="EVALUATION">Évaluation</option>
          <option value="FUNDED">Financé (XFA)</option>
          <option value="LIVE">Live</option>
          <option value="PERSONAL">Perso</option>
        </select>
        <F label="Solde de départ" name="startingBalance" def={v(a?.startingBalance)} hint="50000" />
        <div>
          <label className="label">Ouvert le</label>
          <input name="openedAt" type="date" className="input" defaultValue={a ? isoFromDb(a.openedAt) : todayISO()} />
        </div>
        <F label="Maximum Loss Limit" name="maxLossLimit" def={v(a?.maxLossLimit)} hint="2000" />
        <div>
          <label className="label">Type de drawdown</label>
          <select name="drawdownType" className="input" defaultValue={a?.drawdownType ?? "TRAILING_EOD"}>
            <option value="TRAILING_EOD">Trailing EOD</option>
            <option value="TRAILING_INTRADAY">Trailing intraday</option>
            <option value="STATIC">Statique</option>
          </select>
        </div>
        <F label="MLL figé à (solde)" name="mllLockBalance" def={v(a?.mllLockBalance)} hint="50000" />
        <F label="Perte max / jour" name="dailyLossLimit" def={v(a?.dailyLossLimit)} />
        <F label="Consistance (%)" name="consistencyPct" def={v(a?.consistencyPct)} hint="40" />
        <F label="Jours min. entre payouts" name="payoutMinDays" def={v(a?.payoutMinDays)} hint="3" />
        <F label="Profit min. jour qualifiant" name="payoutMinDayProfit" def={v(a?.payoutMinDayProfit)} hint="vide = tout jour tradé" />
        <F label="Partage profits (%)" name="profitSplitPct" def={v(a?.profitSplitPct)} hint="90" />
        <div>
          <label className="label">Devise</label>
          <input name="currency" className="input" defaultValue={a?.currency ?? "USD"} />
        </div>
        {a && (
          <div>
            <label className="label">Statut</label>
            <select name="status" className="input" defaultValue={a.status}>
              <option value="ACTIVE">Actif</option>
              <option value="PASSED">Validé</option>
              <option value="BREACHED">Grillé</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPersonalFund" defaultChecked={a?.isPersonalFund} className="h-5 w-5" /> Fonds perso (plan de scaling par paliers)
      </label>
      <button className="btn w-full">{a ? "Enregistrer" : "Créer le compte"}</button>
    </form>
  );
}
