import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppContextProvider } from "@/lib/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: {
    default: "TreeForLife | Boutique Plant Shop & Care Assistant",
    template: "%s | TreeForLife",
  },
  description:
    "ร้านต้นไม้และระบบดูแลต้นไม้อัจฉริยะ ปรับตาม 3 ฤดูกาลไทย | Authentic boutique plant shop with smart climate-adjusted care schedules",
  keywords: [
    "ต้นไม้",
    "ร้านต้นไม้",
    "รดน้ำต้นไม้",
    "มอนสเตอร่า",
    "สวนของฉัน",
    "ต้นไม้ฟอกอากาศ",
    "plant shop",
    "plant care",
    "bangkok plants",
  ],
  authors: [{ name: "TreeForLife" }],
  openGraph: {
    type: "website",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    siteName: "TreeForLife",
    title: "TreeForLife — Boutique Plant Shop & Care Assistant",
    description:
      "ร้านต้นไม้และระบบดูแลต้นไม้อัจฉริยะ ปรับตาม 3 ฤดูกาลไทย | Authentic boutique plant shop with smart climate-adjusted care schedules",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a13" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('tfl_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                var locale = localStorage.getItem('tfl_locale');
                if (locale) {
                  document.documentElement.lang = locale;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-sand-50 dark:bg-forest-950 text-forest-950 dark:text-sand-100 transition-colors selection:bg-forest-200 dark:selection:bg-forest-800">
        <AppContextProvider>
          <ServiceWorkerRegister />
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </AppContextProvider>
      </body>
    </html>
  );
}
