import { Badge, Empty, PageHeader, Section } from "@/components/ui";
import { quarterOf, todayISO } from "@/lib/dates";
import { DOMAIN_LABEL } from "@/lib/labels";
import { defaultSpaceId, getCtx } from "@/server/access";
import { dismissCapture, routeCaptureToJournal, routeCaptureToTask } from "@/server/actions/daily";
import { db } from "@/server/db";
import { linkOptions, spaceOptions } from "@/server/horizons";

export const dynamic = "force-dynamic";

const SOURCE: Record<string, string> = { APP: "app", VOICE: "dictée", SHARE: "partage", TELEGRAM: "Telegram" };

export default async function InboxPage() {
  const ctx = await getCtx();
  const [captures, links] = await Promise.all([
    db.capture.findMany({ where: { userId: ctx.userId, status: { in: ["PENDING", "SUGGESTED"] } }, orderBy: { createdAt: "asc" } }),
    linkOptions(ctx, quarterOf(todayISO())),
  ]);
  const spaces = spaceOptions(ctx);
  const defSpace = defaultSpaceId(ctx, "HORIZONS");

  return (
    <>
      <PageHeader title="Inbox" sub={`${captures.length} à trier`} />
      {captures.length === 0 && <Empty>Inbox zéro ✓</Empty>}
      {captures.map((c) => (
        <Section key={c.id}>
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
            <Badge>{SOURCE[c.source]}</Badge>
            <span className="num">{c.createdAt.toLocaleString("fr-FR", { timeZone: "Europe/Lisbon", dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <p className="mb-3 whitespace-pre-line text-[15px]">{c.rawText}</p>
          <details>
            <summary className="cursor-pointer text-sm font-medium text-accent">→ Tâche</summary>
            <form action={routeCaptureToTask} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="title" className="input" defaultValue={c.rawText.split("\n")[0].slice(0, 200)} required />
              <div className="grid grid-cols-2 gap-2">
                <select name="domain" className="input" defaultValue="BUSINESS">
                  {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select name="status" className="input" defaultValue="BACKLOG">
                  <option value="BACKLOG">Backlog</option>
                  <option value="WEEK">Cette semaine</option>
                  <option value="TODAY">Aujourd&apos;hui</option>
                </select>
              </div>
              <select name="link" className="input" defaultValue="">
                <option value="">— Sans lien (orpheline) —</option>
                {links.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <select name="spaceId" className="input" defaultValue={defSpace}>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button className="btn w-full">Créer la tâche</button>
            </form>
          </details>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <form action={routeCaptureToJournal}>
              <input type="hidden" name="id" value={c.id} />
              <button className="btn-ghost w-full">→ Journal</button>
            </form>
            <form action={dismissCapture}>
              <input type="hidden" name="id" value={c.id} />
              <button className="btn-ghost w-full text-muted">Archiver</button>
            </form>
          </div>
        </Section>
      ))}
    </>
  );
}
