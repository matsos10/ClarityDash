export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 text-center">
      <h1 className="text-xl font-semibold">Hors ligne</h1>
      <p className="mt-2 text-sm text-muted">
        Cette page n&apos;a pas encore été visitée. Les captures, la routine, les tâches et le journal restent utilisables : ils seront
        synchronisés au retour du réseau.
      </p>
      <a href="/today" className="btn mt-6">
        Aujourd&apos;hui
      </a>
    </main>
  );
}
