import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Pages déjà visitées disponibles hors ligne (NetworkFirst), repli sur /offline.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{ url: "/offline", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = (() => {
    try {
      return event.data?.json() as { title?: string; body?: string; url?: string; tag?: string };
    } catch {
      return { title: "Base Palmela", body: event.data?.text() };
    }
  })();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Base Palmela", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: data.tag,
      data: { url: data.url ?? "/today" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? "/today";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const win = wins.find((w) => "focus" in w);
      if (win) {
        void (win as WindowClient).navigate(url);
        return (win as WindowClient).focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
