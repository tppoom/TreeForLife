import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { InquiryModal } from "@/components/ui/InquiryModal";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TreeForLife — บ้านแห่งพันธุ์ไม้คัดพิเศษและการดูแลอย่างประณีต",
  description: "แพลตฟอร์มค้นหาพันธุ์ไม้กระถางพร้อมตารางรดน้ำอัจฉริยะ 3 ฤดูกาลไทย บันทึกการดูแลและปรึกษาผู้เชี่ยวชาญจากร้านโดยตรง",
  keywords: ["ต้นไม้ฟอกอากาศ", "มอนสเตอร่า", "ยางอินเดีย", "ตารางรดน้ำ", "ร้านต้นไม้", "ไม้ด่าง", "TreeForLife"],
  authors: [{ name: "TreeForLife" }],
  openGraph: {
    title: "TreeForLife — บ้านแห่งพันธุ์ไม้คัดพิเศษและการดูแลอย่างประณีต",
    description: "ค้นพบต้นไม้ที่เหมาะกับพื้นที่ของคุณ พร้อมคำแนะนำจากประสบการณ์จริงของร้าน",
    type: "website",
    locale: "th_TH",
    siteName: "TreeForLife",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f291e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-sand-50 text-stone-900 selection:bg-forest-800 selection:text-gold-200">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
          <InquiryModal />
        </AppProvider>
      </body>
    </html>
  );
}
