import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Palmela",
  description: "Pilotage de vie : jour → semaine → trimestre → 2029",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Palmela", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
};

// Applique le thème avant le premier rendu (pas de flash).
const themeScript = `try{var t=localStorage.getItem('theme')||'SYSTEM';var d=t==='DARK'||(t==='SYSTEM'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
