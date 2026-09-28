"use client";

import React, { useState } from "react";
import {
  Gem,
  Award,
  Flame,
  Gift,
  CheckCircle2,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Coins,
  Package,
} from "lucide-react";

export interface RewardItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  description: string;
  stockLeft: number;
  badge?: string;
}

export function MemberPointsPrototype() {
  const [points, setPoints] = useState<number>(350);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [redeemedReward, setRedeemedReward] = useState<{
    name: string;
    code: string;
    cost: number;
  } | null>(null);

  const rewards: RewardItem[] = [
    {
      id: "reward-pot",
      name: "กระถางดินเผาแฮนด์เมด 6 นิ้ว",
      category: "อุปกรณ์ปลูก",
      cost: 150,
      description: "ดินเผาระบายอากาศทรงโมเดิร์น พร้อมจานรองดินเผาเคลือบด้าน",
      stockLeft: 8,
      badge: "ยอดนิยม",
    },
    {
      id: "reward-fert",
      name: "ชุดปุ๋ยออร์แกนิคบำรุงใบ",
      category: "บำรุงรักษา",
      cost: 200,
      description: "ปุ๋ยมูลไส้เดือนสกัดเย็นและธาตุอาหารรอง สูตรใบเขียวเงางาม",
      stockLeft: 15,
      badge: "ออร์แกนิค 100%",
    },
    {
      id: "reward-discount",
      name: "คูปองส่วนลด 15%",
      category: "ส่วนลดพิเศษ",
      cost: 300,
      description: "ใช้เป็นส่วนลดสำหรับการสั่งซื้อต้นไม้หรือบริการจัดสวน (ไม่มีขั้นต่ำ)",
      stockLeft: 20,
      badge: "คุ้มค่าที่สุด",
    },
    {
      id: "reward-shears",
      name: "กรรไกรตัดแต่งกิ่งสแตนเลสสตีล",
      category: "เครื่องมือทำสวน",
      cost: 450,
      description: "ใบมีดสแตนเลสเกรดพรีเมียม ด้ามจับไม้สักแท้ สัมผัสหรูหรา",
      stockLeft: 5,
    },
  ];

  const handleRedeem = (reward: RewardItem) => {
    if (points >= reward.cost) {
      const code = `TFL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setPoints((prev) => prev - reward.cost);
      setRedeemedReward({
        name: reward.name,
        code,
        cost: reward.cost,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-forest-900 border border-sand-200 dark:border-forest-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 p-5 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Gem className="w-3.5 h-3.5" />
              <span>Phase 3 Platform Feature</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span>💎 บัตรสมาชิก & แต้มสะสม Green Club</span>
            </h3>
            <p className="text-xs sm:text-sm text-sand-200 max-w-2xl">
              ระบบสมาชิกพรีเมียม สะสมคะแนนจากการดูแลต้นไม้ประจำวัน เช็คอินรดน้ำต่อเนื่อง และแลกรับของรางวัลพิเศษสำหรับชาว Green Club
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-forest-700/80 rounded-lg text-xs font-medium text-emerald-300 flex items-center gap-1.5 border border-forest-600">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Emerald Tier Member</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Luxury Botanical Loyalty Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-6 sm:p-7 shadow-elevated border border-gold-500/30">
          {/* Card subtle background pattern */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute right-4 top-4 text-gold-400/20 pointer-events-none">
            <Gem className="w-28 h-28" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-xs font-mono tracking-widest text-gold-400 uppercase">
                  TreeForLife Botanical Loyalty
                </span>
                <h4 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-sand-50">
                  Green Club Privilege Pass
                </h4>
              </div>
              <div className="flex items-center gap-2 bg-forest-800/80 px-3 py-1 rounded-full border border-gold-500/40 text-xs text-gold-300">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>ระดับ Emerald</span>
              </div>
            </div>

            {/* Middle Section: Points & Streak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="bg-forest-950/50 p-4 rounded-xl border border-forest-700/60 backdrop-blur-sm">
                <span className="text-xs text-sand-300 flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-gold-400" />
                  <span>แต้มสะสมปัจจุบัน</span>
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-gold-300">
                  {`${points} แต้ม`}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>+15 แต้มจากการบันทึกรดน้ำสัปดาห์นี้</span>
                </div>
              </div>

              <div className="bg-forest-950/50 p-4 rounded-xl border border-forest-700/60 backdrop-blur-sm">
                <span className="text-xs text-sand-300 flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>สถิติเช็คอินดูแลต้นไม้</span>
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-sand-100 flex items-center gap-2">
                  <span>{`${streakDays} วัน`}</span>
                  <span className="text-xs font-normal text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    🔥 ติดต่อกัน
                  </span>
                </div>
                <div className="text-[11px] text-sand-400 mt-1">
                  รดน้ำและบันทึกครบอีก 1 วัน เพื่อรับโบนัส +50 แต้ม
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex flex-wrap items-center justify-between text-xs text-sand-300 pt-2 border-t border-forest-700/60 gap-2">
              <div className="font-mono text-[11px]">
                ID: TFL-MEMBER-8829-TH
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span>รหัสบาร์โค้ดสมาชิกร้าน: พร้อมสแกน</span>
                <QrCode className="w-4 h-4 text-sand-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Confirmation Modal / Toast */}
        {redeemedReward && (
          <div className="p-4 sm:p-5 bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  แลกรับสำเร็จ! คุณได้รับสิทธิ์ &quot;{redeemedReward.name}&quot;
                </h5>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  รหัสคูปอง: <span className="font-mono font-bold bg-white dark:bg-forest-900 px-2 py-0.5 rounded border border-emerald-400">{redeemedReward.code}</span> (หักคะแนน {redeemedReward.cost} แต้มเรียบร้อย)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRedeemedReward(null)}
              className="px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/50 rounded-lg transition"
            >
              ปิดการแจ้งเตือน
            </button>
          </div>
        )}

        {/* Rewards Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-forest-900 dark:text-sand-100 flex items-center gap-2">
                <Gift className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                <span>ของรางวัลที่แลกได้ (Redeemable Rewards)</span>
              </h4>
              <p className="text-xs text-sand-600 dark:text-sand-400">
                ใช้แต้มสะสม Green Club เพื่อแลกรับสิทธิประโยชน์และสินค้าพฤกษศาสตร์พิเศษ
              </p>
            </div>
            <span className="text-xs text-sand-500 dark:text-sand-400">
              แต้มคงเหลือ: <strong className="text-forest-900 dark:text-emerald-400 font-mono">{`${points} แต้ม`}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward) => {
              const canAfford = points >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                    canAfford
                      ? "bg-white dark:bg-forest-900 border-sand-200 dark:border-forest-800 shadow-sm hover:border-forest-500"
                      : "bg-sand-50/60 dark:bg-forest-950/40 border-sand-200/60 dark:border-forest-900 opacity-75"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-sand-500 dark:text-sand-400">
                        {reward.category}
                      </span>
                      {reward.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300 border border-gold-300/40">
                          {reward.badge}
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-forest-900 dark:text-sand-100 leading-snug">
                      {reward.name}
                    </h5>

                    <p className="text-xs text-sand-600 dark:text-sand-400 line-clamp-2">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-sand-200/60 dark:border-forest-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-mono text-forest-900 dark:text-emerald-400">
                        {`${reward.cost} แต้ม`}
                      </span>
                      <span className="text-[11px] text-sand-500 dark:text-sand-400">
                        เหลือ {reward.stockLeft} ชิ้น
                      </span>
                    </div>

                    <button
                      type="button"
                      role="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? "bg-forest-800 hover:bg-forest-900 text-white shadow-sm active:scale-95"
                          : "bg-sand-200 dark:bg-forest-800 text-sand-400 dark:text-sand-500 cursor-not-allowed"
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{canAfford ? "แลกรับรางวัล" : "แต้มไม่เพียงพอ"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
