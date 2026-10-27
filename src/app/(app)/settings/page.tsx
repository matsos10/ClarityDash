import type { Module } from "@prisma/client";
import { GoogleConnectButton, LogoutButton, PushToggle, ThemePicker } from "@/components/client/settings-client";
import { PageHeader, Section } from "@/components/ui";
import { getCtx } from "@/server/access";
import { toggleSpaceModule } from "@/server/actions/daily";
import { createTelegramLink, unlinkTelegram } from "@/server/actions/integrations";
import { aiEnabled } from "@/server/ai/triage";
import { db } from "@/server/db";
import { googleStatus } from "@/server/google";
import { sttEnabled } from "@/server/stt";

const MODULES: { key: Module; label: string; phase?: number }[] = [
  { key: "HORIZONS", label: "Horizons (tâches, OKR, vision)" },
  { key: "ROUTINE", label: "Routine" },
  { key: "TRADING", label: "Trading" },
  { key: "BUSINESS", label: "Business", phase: 3 },
  { key: "FINANCE", label: "Finances", phase: 3 },
  { key: "HOME", label: "Maison & chantiers", phase: 3 },
  { key: "FAMILY", label: "Famille", phase: 3 },
  { key: "ADMIN", label: "Véhicule & admin", phase: 3 },
];

const EXPORTS = [
  ["tasks", "Tâches"],
  ["routine", "Routine"],
  ["journal", "Journal"],
  ["okr", "OKR"],
  ["trades", "Trades"],
  ["payouts", "Payouts"],
  ["macro", "Analyses macro"],
] as const;

export default async function SettingsPage() {
  const ctx = await getCtx();
  const shared = ctx.spaces.filter((s) => s.kind !== "PERSONAL");
  const [google, telegram, code] = await Promise.all([
    googleStatus(ctx.userId),
    db.telegramLink.findUnique({ where: { userId: ctx.userId } }),
    db.verificationToken.findFirst({ where: { identifier: `telegram:${ctx.userId}`, expires: { gt: new Date() } } }),
  ]);
  const bot = process.env.TELEGRAM_BOT_USERNAME;

  return (
    <>
      <PageHeader title="Réglages" back="/more" />

      <Section title="Thème">
        <ThemePicker />
      </Section>

      <Section title="Google Agenda">
        {google.calendar ? (
          <p className="mb-2 text-sm text-good">Connecté ✓ — agenda du jour, brief et blocs de timeboxing.</p>
        ) : (
          <p className="mb-2 text-sm text-muted">
            {google.linked ? "Compte Google lié sans accès à l'agenda." : "Aucun compte Google lié."} Autorise l&apos;accès à Google Agenda pour afficher
            l&apos;agenda et créer les blocs.
          </p>
        )}
        {!google.refresh && google.calendar && <p className="mb-2 text-xs text-warn">Jeton de rafraîchissement absent : reconnecte pour éviter les déconnexions.</p>}
        <GoogleConnectButton label={google.calendar ? "Reconnecter Google" : "Connecter Google Agenda"} />
      </Section>

      <Section title="Telegram">
        {telegram ? (
          <>
            <p className="mb-2 text-sm text-good">Lié ✓ — capture texte / vocale, brief du matin à 7:00.</p>
            <form action={unlinkTelegram}>
              <button className="btn-ghost w-full">Délier</button>
            </form>
          </>
        ) : code ? (
          <>
            <p className="mb-2 text-sm">Ouvre le lien (valable 15 min) puis appuie sur « Démarrer » :</p>
            {bot ? (
              <a href={`https://t.me/${bot}?start=${code.token}`} className="btn w-full">
                Ouvrir @{bot}
              </a>
            ) : (
              <p className="num rounded-xl bg-line p-3 text-center text-sm">/start {code.token}</p>
            )}
          </>
        ) : (
          <form action={createTelegramLink}>
            <button className="btn w-full">Lier ce compte</button>
          </form>
        )}
        <p className="mt-2 text-xs text-muted">
          Tri IA : {aiEnabled() ? "actif" : "inactif (ANTHROPIC_API_KEY)"} · Vocal : {sttEnabled() ? "actif" : "inactif (STT_URL)"}
        </p>
      </Section>

      <Section title="Notifications push">
        <PushToggle publicKey={process.env.VAPID_PUBLIC_KEY || null} />
        <p className="mt-2 text-xs text-muted">Brief du matin (07:00), check-list trading (08:45), revue du soir (21:00), revue hebdo (dimanche 18:00).</p>
      </Section>

      {shared.map((s) => (
        <Section key={s.id} title={`Partage · ${s.name}`}>
          <p className="mb-2 text-xs text-muted">Les données de ton espace perso restent privées. Ne sont visibles dans « {s.name} » que les modules cochés.</p>
          <ul className="divide-y divide-line">
            {MODULES.map((m) => {
              const on = s.modules.includes(m.key);
              return (
                <li key={m.key}>
                  <form action={toggleSpaceModule} className="flex min-h-[48px] items-center justify-between">
                    <input type="hidden" name="spaceId" value={s.id} />
                    <input type="hidden" name="module" value={m.key} />
                    <input type="hidden" name="enabled" value={on ? "false" : "true"} />
                    <span className="text-[15px]">
                      {m.label} {m.phase && <span className="text-xs text-muted">(phase {m.phase})</span>}
                    </span>
                    <button className={`h-7 w-12 rounded-full p-0.5 transition ${on ? "bg-good" : "bg-line"}`} aria-pressed={on}>
                      <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}

      <Section title="Export CSV">
        <div className="grid grid-cols-2 gap-2">
          {EXPORTS.map(([k, v]) => (
            <a key={k} href={`/api/export/${k}`} className="btn-ghost">
              {v}
            </a>
          ))}
        </div>
      </Section>

      <LogoutButton />
    </>
  );
}
