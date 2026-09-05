import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getSpeciesList } from "@/lib/services/speciesService";
import {
  Search,
  Sparkles,
  ArrowRight,
  Sun,
  Home,
  ShieldCheck,
  Award,
  Wind,
  Layers,
  Heart,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 60; // ISR cache 60 seconds

export default async function HomePage() {
  // Fetch 8 in-stock species for the in-store showcase
  const inStockSpecies = await getSpeciesList({
    stockStatus: "in_stock",
    limit: 8,
    sort: "in_stock_first",
  });

  const quickShortcuts = [
    { label: "ในบ้าน & คอนโด", href: "/search?placement=indoor", icon: <Home className="w-4 h-4" /> },
    { label: "ทนแดดจัด", href: "/search?light=full_sun", icon: <Sun className="w-4 h-4" /> },
    { label: "ปลอดภัยกับสัตว์เลี้ยง", href: "/search?pet=safe", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "เลี้ยงง่ายมือใหม่", href: "/search?diff=1", icon: <Award className="w-4 h-4" /> },
    { label: "ฟอกอากาศ", href: "/search?q=ฟอกอากาศ", icon: <Wind className="w-4 h-4" /> },
    { label: "ต้นเล็กวางโต๊ะ", href: "/search?size=xs", icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-sand-200/70 bg-gradient-to-b from-sand-100/60 via-sand-50 to-sand-50">
        <div className="absolute inset-0 bg-[radial-gradient(#d5c3aa_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-900/5 border border-forest-900/15 text-forest-900 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>ต้นไม้คัดฟอร์มพิเศษ พร้อมสูตรการดูแลเฉพาะตัว 3 ฤดูกาลไทย</span>
          </div>

          {/* Editorial Headline */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-forest-950 leading-[1.15]">
              ความงดงามของธรรมชาติ <br className="hidden sm:inline" />
              <span className="italic font-normal text-forest-800">ที่เติบโตได้จริง</span> ในบ้านคุณ
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 leading-relaxed font-light">
              เราไม่เพียงส่งมอบต้นไม้สวยจากเรือนเพาะชำ แต่สร้างตารางดูแลอัจฉริยะที่คำนวณตามขนาดกระถาง แสง และฤดูจริง พร้อมคำแนะนำจากคนปลูกที่บ้าน
            </p>
          </div>

          {/* Prominent Search Bar (SPEC §6.1) */}
          <div className="max-w-2xl mx-auto">
            <form
              action="/search"
              method="GET"
              className="relative flex items-center bg-white rounded-2xl p-2 shadow-card border border-sand-300 hover:border-forest-600/40 focus-within:border-forest-700 focus-within:ring-4 focus-within:ring-forest-800/10 transition-all"
            >
              <div className="pl-4 pr-2 text-stone-400">
                <Search className="w-5 h-5 text-forest-800" />
              </div>
              <input
                type="text"
                name="q"
                placeholder="ค้นหาชื่อต้นไม้ เช่น มอนสเตอร่า, ต้นไม้ห้องแอร์, ปลอดภัยกับแมว..."
                className="w-full py-2.5 text-sm sm:text-base text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-sand-50 font-medium text-xs sm:text-sm transition-colors shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>ค้นหา</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 6 Quick Shortcuts (SPEC §6.1) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-5">
              <span className="text-xs text-stone-600 font-medium mr-1">ทางลัดยอดฮิต:</span>
              {quickShortcuts.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-stone-700 hover:text-forest-900 rounded-xl text-xs border border-sand-300 hover:border-forest-700 shadow-sm transition-all"
                >
                  <span className="text-forest-700">{chip.icon}</span>
                  <span>{chip.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* "มีที่ร้านตอนนี้" In-Stock Showcase Row (SPEC §6.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-forest-700 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>อัปเดตสต็อกสดจากเรือนเพาะชำ</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-forest-950">
              มีพร้อมรับที่ร้านตอนนี้
            </h2>
          </div>
          <Link
            href="/search?stock=in_stock"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-900 hover:text-forest-700 underline underline-offset-4"
          >
            <span>ดูพันธุ์ไม้ทั้งหมดที่มี</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Species Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {inStockSpecies.map((plant) => (
            <Link
              key={plant.id}
              href={`/plants/${plant.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-sand-200 hover:border-forest-700/40 shadow-soft hover:shadow-card card-hover-effect flex flex-col"
            >
              {/* Image Container with Luxury Badge */}
              <div className="relative aspect-[4/3] bg-sand-100 overflow-hidden">
                <Image
                  src={plant.primaryImage}
                  alt={plant.imageAlt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-forest-950/80 backdrop-blur-md text-gold-300 text-[10px] font-medium border border-gold-400/30">
                    ถ่ายที่ร้าน
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-medium shadow-sm">
                    มีที่ร้าน
                  </span>
                </div>
              </div>

              {/* Plant Meta Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700">
                    {plant.family.split(" ")[0]}
                  </span>
                  <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-forest-800 transition-colors line-clamp-1">
                    {plant.nameTh}
                  </h3>
                  <p className="text-xs text-stone-500 italic line-clamp-1 font-serif">
                    {plant.nameSci}
                  </p>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {plant.summary}
                </p>

                <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>ความยาก: {"★".repeat(plant.difficulty)}{"☆".repeat(5 - plant.difficulty)}</span>
                  <span className="text-forest-800 font-semibold group-hover:translate-x-0.5 transition-transform">
                    รายละเอียด →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Value Props & Philosophy (SPEC §1.1) */}
      <section className="bg-sand-100/70 border-y border-sand-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
              จุดต่างที่ลอกไม่ได้
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-forest-950">
              ทำไมคนรักต้นไม้จึงไว้วางใจ TreeForLife
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                ตารางรดน้ำ 3 ฤดูกาลไทย
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                ไม่ใช้สูตรเหมารวมแบบแอปต่างชาติ แต่คำนวณจากฤดูร้อน ฝน หนาว วัสดุกระถาง และตำแหน่งจริงในบ้านคุณ เพื่อไม่ให้รากเน่าหรือต้นขาดน้ำ
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                ความรู้จริงจากคนปลูกที่บ้าน
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                ทุกพันธุ์ผ่านการทดลองเลี้ยงและบันทึกข้อควรระวังโดยครอบครัวเรา "ที่ร้านบอกว่า" คือเคล็ดลับเฉพาะที่หาไม่ได้จากอินเทอร์เน็ตทั่วไป
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                ไม่มีตะกร้า ทักคุยกับคนจริง
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                เราคัดต้นไม้ให้ตรงใจคุณที่สุด ทุกการสอบถามเชื่อมต่อไปยังแชท LINE ของร้านพร้อมรหัสอ้างอิงและรูปต้นที่คุณสนใจในคลิกเดียว
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start My Garden CTA Banner (SPEC §6.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-forest-950 text-sand-50 p-8 sm:p-12 md:p-16 border border-forest-800 shadow-elevated">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-forest-800/40 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/60 border border-forest-700 text-gold-300 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>เริ่มใช้งานได้ทันที ไม่ต้องสมัครสมาชิก</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-sand-50 leading-tight">
              สร้างปฏิทินดูแล <br />
              <span className="text-gold-400 italic">สำหรับต้นไม้ที่คุณมีอยู่แล้ว</span>
            </h2>
            <p className="text-sand-300 text-sm sm:text-base leading-relaxed font-light">
              แม้คุณจะไม่ได้ซื้อต้นไม้จากเรา ก็สามารถเพิ่มต้นไม้ในบ้านเข้าสู่ "สวนของฉัน" ให้ระบบช่วยคำนวณรอบรดน้ำและแจ้งเตือนเมื่อถึงกำหนดได้ฟรี
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/garden/add"
                className="px-6 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold text-sm transition-all shadow-gold flex items-center gap-2"
              >
                <span>เพิ่มต้นแรกเข้าสวนของฉัน</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="px-6 py-3.5 rounded-xl bg-forest-900/80 hover:bg-forest-800 text-sand-100 font-medium text-sm border border-forest-700 transition-colors"
              >
                <span>เลือกดูพันธุ์ไม้ทั้งหมด</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
