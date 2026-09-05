import React from "react";
import Link from "next/link";
import { MessageCircle, Shield, Sparkles, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest-950 text-sand-100 border-t border-forest-900/60 pt-16 pb-28 md:pb-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900">
          {/* Brand & Philosophy */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-gold-400 border border-forest-800">
                <span className="font-serif text-lg font-bold">T</span>
              </div>
              <span className="font-serif text-2xl font-medium tracking-tight text-sand-50">
                TreeForLife
              </span>
            </div>
            <p className="text-sm text-sand-300/80 max-w-md leading-relaxed font-light">
              บ้านแห่งพันธุ์ไม้คัดพิเศษและการดูแลอย่างประณีต เราเชื่อว่าต้นไม้ที่ดีไม่ใช่แค่สวยงามตอนซื้อ แต่ต้องเติบโตได้อย่างสมบูรณ์ในบ้านคุณ ด้วยตารางดูแลเฉพาะตัวที่ออกแบบตามสภาพจริง
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ภาพถ่ายจากต้นจริงที่ร้าน 100% · ไม่มีรูปจำลอง</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-sand-50 uppercase mb-4">
              แผนผังบริการ
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link href="/search" className="hover:text-gold-300 transition-colors">
                  ค้นหาและคัดเลือกพันธุ์ไม้ (Catalog)
                </Link>
              </li>
              <li>
                <Link href="/garden" className="hover:text-gold-300 transition-colors">
                  สวนของฉัน & ตารางรดน้ำอัจฉริยะ
                </Link>
              </li>
              <li>
                <Link href="/today" className="hover:text-gold-300 transition-colors">
                  ภารกิจประจำวันนี้ (Today's Care)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-300 transition-colors">
                  ระบบจัดการหลังบ้านร้าน
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Shop Contact */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-sand-50 uppercase mb-4">
              ติดต่อและเยี่ยมชมร้าน
            </h4>
            <div className="space-y-3 text-xs text-sand-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>เรือนเพาะชำ TreeForLife เปิดบริการทุกวัน 08:30 – 18:00 น.</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#06C755] shrink-0" />
                <span>LINE Official: @treeforlife</span>
              </div>
              <div className="flex items-center gap-2 text-sand-400">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ปฏิบัติตามมาตรฐาน PDPA ปกป้องข้อมูลส่วนบุคคล</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400 font-light">
          <p>© {new Date().getFullYear()} TreeForLife. All rights reserved. Crafted with care for plant lovers.</p>
          <div className="flex items-center gap-6">
            <span>ความเป็นส่วนตัว & ข้อกำหนด (PDPA)</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" /> for Thai Botanicals
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
