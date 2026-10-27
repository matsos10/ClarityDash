import { PageHeader, Section } from "@/components/ui";
import { getCtx } from "@/server/access";
import { addChecklistItem, addSetup, toggleChecklistItem, toggleSetup } from "@/server/actions/trading";
import { db } from "@/server/db";

export default async function TradingConfigPage() {
  const ctx = await getCtx();
  const [items, setups] = await Promise.all([
    db.preSessionChecklistItem.findMany({ where: { spaceId: ctx.personalSpaceId }, orderBy: { order: "asc" } }),
    db.tradeSetup.findMany({ where: { spaceId: ctx.personalSpaceId }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Check-list & setups" back="/trading" />
      <Section title="Check-list pré-session">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className={`flex min-h-[44px] items-center gap-2 text-sm ${i.active ? "" : "opacity-50"}`}>
              <span className="flex-1">
                {i.label} {!i.required && <span className="text-xs text-muted">(optionnel)</span>}
              </span>
              <form action={toggleChecklistItem}>
                <input type="hidden" name="id" value={i.id} />
                <button className="btn-sm">{i.active ? "Désactiver" : "Activer"}</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addChecklistItem} className="mt-3 space-y-2">
          <input name="label" className="input" placeholder="Nouvel élément" required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="required" defaultChecked className="h-5 w-5" /> Obligatoire
          </label>
          <button className="btn w-full">Ajouter</button>
        </form>
      </Section>
      <Section title="Setups">
        <ul className="divide-y divide-line">
          {setups.map((s) => (
            <li key={s.id} className={`flex min-h-[44px] items-center gap-2 text-sm ${s.active ? "" : "opacity-50"}`}>
              <span className="flex-1">{s.name}</span>
              <form action={toggleSetup}>
                <input type="hidden" name="id" value={s.id} />
                <button className="btn-sm">{s.active ? "Désactiver" : "Activer"}</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addSetup} className="mt-3 flex gap-2">
          <input name="name" className="input" placeholder="Nouveau setup" required />
          <button className="btn shrink-0">+</button>
        </form>
      </Section>
    </>
  );
}
