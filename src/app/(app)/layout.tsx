import { Suspense } from "react";
import { BottomNav } from "@/components/client/bottom-nav";
import { FlashError } from "@/components/client/flash-error";
import { SyncStatus } from "@/components/client/sync-status";
import { getCtx } from "@/server/access";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getCtx();
  return (
    <>
      <SyncStatus />
      <Suspense>
        <FlashError />
      </Suspense>
      <main className="mx-auto max-w-xl px-4 pb-28 pt-[calc(1rem+env(safe-area-inset-top))]">{children}</main>
      <BottomNav />
    </>
  );
}
