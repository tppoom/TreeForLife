import type { Copy } from "./types";

type Reward = { name: string; category: string; description: string; badge?: string };

export const pointsTh = {
  title: "💎 บัตรสมาชิก & แต้มสะสม Green Club",
  subtitle:
    "ระบบสมาชิกพรีเมียม สะสมคะแนนจากการดูแลต้นไม้ประจำวัน เช็คอินรดน้ำต่อเนื่อง และแลกรับของรางวัลพิเศษสำหรับชาว Green Club",
  tier_badge: "Emerald Tier Member",
  tier: "ระดับ Emerald",
  points_label: "แต้มสะสมปัจจุบัน",
  points: "{count} แต้ม",
  weekly_bonus: "+15 แต้มจากการบันทึกรดน้ำสัปดาห์นี้",
  streak_label: "สถิติเช็คอินดูแลต้นไม้",
  streak: "{count} วัน",
  streak_badge: "🔥 ติดต่อกัน",
  streak_hint: "รดน้ำและบันทึกครบอีก 1 วัน เพื่อรับโบนัส +50 แต้ม",
  barcode: "รหัสบาร์โค้ดสมาชิกร้าน: พร้อมสแกน",
  redeemed_title: 'แลกรับสำเร็จ! คุณได้รับสิทธิ์ "{name}"',
  coupon_code: "รหัสคูปอง:",
  deducted: "(หักคะแนน {count} แต้มเรียบร้อย)",
  dismiss: "ปิดการแจ้งเตือน",
  rewards_title: "ของรางวัลที่แลกได้ (Redeemable Rewards)",
  rewards_subtitle: "ใช้แต้มสะสม Green Club เพื่อแลกรับสิทธิประโยชน์และสินค้าพฤกษศาสตร์พิเศษ",
  balance: "แต้มคงเหลือ:",
  stock_left: "เหลือ {count} ชิ้น",
  redeem: "แลกรับรางวัล",
  not_enough: "แต้มไม่เพียงพอ",
  rewards: {
    "reward-pot": {
      name: "กระถางดินเผาแฮนด์เมด 6 นิ้ว",
      category: "อุปกรณ์ปลูก",
      description: "ดินเผาระบายอากาศทรงโมเดิร์น พร้อมจานรองดินเผาเคลือบด้าน",
      badge: "ยอดนิยม",
    },
    "reward-fert": {
      name: "ชุดปุ๋ยออร์แกนิคบำรุงใบ",
      category: "บำรุงรักษา",
      description: "ปุ๋ยมูลไส้เดือนสกัดเย็นและธาตุอาหารรอง สูตรใบเขียวเงางาม",
      badge: "ออร์แกนิค 100%",
    },
    "reward-discount": {
      name: "คูปองส่วนลด 15%",
      category: "ส่วนลดพิเศษ",
      description: "ใช้เป็นส่วนลดสำหรับการสั่งซื้อต้นไม้หรือบริการจัดสวน (ไม่มีขั้นต่ำ)",
      badge: "คุ้มค่าที่สุด",
    },
    "reward-shears": {
      name: "กรรไกรตัดแต่งกิ่งสแตนเลสสตีล",
      category: "เครื่องมือทำสวน",
      description: "ใบมีดสแตนเลสเกรดพรีเมียม ด้ามจับไม้สักแท้ สัมผัสหรูหรา",
    },
  } as Record<string, Reward>,
};

export const pointsEn: Copy<typeof pointsTh> = {
  title: "💎 Green Club Membership & Points",
  subtitle:
    "A premium membership: earn points for daily plant care and watering streaks, then redeem exclusive rewards for Green Club members",
  tier_badge: "Emerald Tier Member",
  tier: "Emerald tier",
  points_label: "Current points",
  points: "{count} pts",
  weekly_bonus: "+15 pts for logging waterings this week",
  streak_label: "Care check-in streak",
  streak: "{count} days",
  streak_badge: "🔥 in a row",
  streak_hint: "Water and log for 1 more day to earn a +50 pt bonus",
  barcode: "Member barcode: ready to scan",
  redeemed_title: 'Redeemed! You now have "{name}"',
  coupon_code: "Coupon code:",
  deducted: "({count} pts deducted)",
  dismiss: "Dismiss",
  rewards_title: "Redeemable Rewards",
  rewards_subtitle: "Use your Green Club points for perks and special botanical products",
  balance: "Balance:",
  stock_left: "{count} left",
  redeem: "Redeem",
  not_enough: "Not enough points",
  rewards: {
    "reward-pot": {
      name: "Handmade 6-inch terracotta pot",
      category: "Planting gear",
      description: "Breathable modern terracotta pot with a matte-glazed saucer",
      badge: "Popular",
    },
    "reward-fert": {
      name: "Organic foliage fertilizer set",
      category: "Plant care",
      description: "Cold-extracted worm-casting fertilizer with micronutrients for glossy green leaves",
      badge: "100% organic",
    },
    "reward-discount": {
      name: "15% discount coupon",
      category: "Special discount",
      description: "Use on plant orders or garden services (no minimum spend)",
      badge: "Best value",
    },
    "reward-shears": {
      name: "Stainless-steel pruning shears",
      category: "Garden tools",
      description: "Premium stainless blades with a solid teak handle",
    },
  },
};
