import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getCtx } from "@/server/access";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const ctx = await getCtx();
  const inbox = await db.capture.count({ where: { userId: ctx.userId, status: { in: ["PENDING", "SUGGESTED"] } } });
  const items = [
    { href: "/inbox", label: "Inbox", hint: inbox ? `${inbox} à trier` : "vide" },
    { href: "/okr", label: "OKR du trimestre", hint: "Objectifs de couple" },
    { href: "/vision", label: "Vision 2029", hint: "Compte à rebours, jalons" },
    { href: "/projects", label: "Projets", hint: "Prochaine action obligatoire" },
    { href: "/routine", label: "Routine", hint: "Habitudes et séries" },
    { href: "/journal", label: "Journal", hint: "Revue du soir" },
    { href: "/week/review", label: "Revue hebdo", hint: "Le dimanche" },
    { href: "/settings", label: "Réglages", hint: "Partage, thème, notifications, export" },
  ];
  return (
    <>
      <PageHeader title={`Bonjour ${ctx.name.split(" ")[0]}`} />
      <ul className="card divide-y divide-line p-0">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex min-h-[56px] items-center justify-between px-4">
              <span className="text-[15px]">{i.label}</span>
              <span className="text-xs text-muted">{i.hint} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
