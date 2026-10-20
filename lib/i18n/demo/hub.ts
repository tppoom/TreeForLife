import type { Copy } from "./types";

export const hubTh = {
  badge: "Interactive All-Phases Prototype",
  intro: "ภาพรวมโครงการครบทุกเฟสของร้านต้นไม้ ทดลองสัมผัสประสบการณ์ฟีเจอร์ AI และระบบการดูแลต้นไม้อัจฉริยะล่วงหน้าได้ในหน้าเดียว",
  tab_all: "ทั้งหมด (All Phases)",
  tab_phase1: "Phase 1: ระบบหลัก",
  tab_phase2: "Phase 2: AI อัจฉริยะ",
  tab_phase3: "Phase 3: ชุมชน & เติบโต",
  phase2_title: "Phase 2: ฟีเจอร์ AI อัจฉริยะ",
  phase2_desc: "สัมผัสประสบการณ์เทคโนโลยี AI สำหรับการดูแลต้นไม้ วินิจฉัยโรค ออกแบบสวน และจัดสรรงบประมาณ",
  phase3_title: "Phase 3: ชุมชนและการเติบโต",
  phase3_desc: "เครื่องมือสำหรับขยายธุรกิจ ขับเคลื่อนคอมมูนิตี้คนรักต้นไม้ ระบบสมาชิก และการวิเคราะห์หน้าร้าน",
};

export const hubEn: Copy<typeof hubTh> = {
  badge: "Interactive All-Phases Prototype",
  intro: "Every phase of the plant shop in one place. Try the upcoming AI features and the smart plant-care system before they launch.",
  tab_all: "All Phases",
  tab_phase1: "Phase 1: Core",
  tab_phase2: "Phase 2: Smart AI",
  tab_phase3: "Phase 3: Community & Growth",
  phase2_title: "Phase 2: Smart AI Features",
  phase2_desc: "AI for plant care: diagnose diseases, design gardens and plan budgets",
  phase3_title: "Phase 3: Community & Growth",
  phase3_desc: "Tools to grow the business: a plant-lover community, membership and storefront analytics",
};

export const phase1Th = {
  live_badge: "Phase 1: ระบบหลักที่พร้อมใช้งานจริง (Live on Production)",
  title: "ระบบหลักที่เปิดให้บริการแล้วในปัจจุบัน",
  desc: "ฟังก์ชันการทำงานพื้นฐานที่สมบูรณ์แบบ 100% พร้อมใช้งานจริงบนระบบ TreeForLife ทั้งการสืบค้นพันธุ์ไม้ วางแผนดูแลตามฤดูกาลไทย บันทึกภารกิจรายวัน และระบบเชื่อมต่อหน้าร้าน",
  live: "Live on Production",
  cards: {
    catalog: {
      badge: "30 พันธุ์ไม้คัดสรร",
      title: "🌿 คลัง 30 พันธุ์ไม้พร้อมตัวกรอง",
      description:
        "ค้นหาและคัดกรองพันธุ์ไม้ตามระดับแสงแดด ความต้องการน้ำ ความปลอดภัยต่อสัตว์เลี้ยง พร้อมข้อมูลเชิงลึกและการดูแล",
      features: ["30 สายพันธุ์ข้อมูลสมบูรณ์", "ฟิลเตอร์แสง / น้ำ / สัตว์เลี้ยง", "บันทึกลงสวนได้ทันที"],
      linkText: "สำรวจคลังต้นไม้",
    },
    garden: {
      badge: "สูตร ML 3 ฤดูกาล",
      title: "🏡 สวนของฉันและตารางรดน้ำ 3 ฤดู",
      description:
        "จัดการคอลเลกชันต้นไม้ในบ้าน คำนวณปริมาณน้ำและรอบการรดตามฤดูร้อน ฝน และหนาวของสภาพอากาศไทยอย่างแม่นยำ",
      features: ["คำนวณปริมาณน้ำตามฤดูกาล", "ประเมินสุขภาพต้นไม้เรียลไทม์", "แจ้งเตือนเมื่อถึงรอบดูแล"],
      linkText: "ไปที่สวนของฉัน",
    },
    today: {
      badge: "Checklist ประจำวัน",
      title: "📅 งานดูแลประจำวันพร้อมบันทึก",
      description:
        "เช็คลิสต์งานดูแลต้นไม้ในแต่ละวัน รดน้ำ พรวนดิน ใส่ปุ๋ย พร้อมปุ่มบันทึก 1-Click และระบบสะสม Streak เพื่อความต่อเนื่อง",
      features: ["Today's Task Checklist", "บันทึกการรดน้ำ 1-Click", "ระบบนับความต่อเนื่อง (Streak)"],
      linkText: "ตรวจเช็คงานวันนี้",
    },
    inquiry: {
      badge: "ติดต่อร้านค้าทันที",
      title: "💬 สอบถามและขอใบเสนอราคาผ่าน LINE OA",
      description:
        "เชื่อมต่อทีมงานผู้เชี่ยวชาญโดยตรง ส่งต่อความต้องการ สร้าง Reference Code อัตโนมัติ เพื่อติดตามสถานะอย่างมืออาชีพ",
      features: ["สร้าง Ref Code ติดตามอัตโนมัติ", "ส่งต่อข้อมูลต้นไม้ในคลิกเดียว", "เปิดช่องทางคุยผ่าน LINE OA"],
      linkText: "เปิดแบบฟอร์มสอบถาม",
    },
  },
};

export const phase1En: Copy<typeof phase1Th> = {
  live_badge: "Phase 1: Core system (Live on Production)",
  title: "Core features available today",
  desc: "The complete core of TreeForLife, live in production: species search, Thai-season care planning, daily task logging and the link to the shop.",
  live: "Live on Production",
  cards: {
    catalog: {
      badge: "30 curated species",
      title: "🌿 Catalog of 30 species with filters",
      description:
        "Search and filter plants by light, water needs and pet safety, with in-depth care information",
      features: ["30 fully documented species", "Light / water / pet filters", "Save to your garden instantly"],
      linkText: "Explore the catalog",
    },
    garden: {
      badge: "3-season ML formula",
      title: "🏡 My Garden & 3-season watering schedule",
      description:
        "Manage your home collection and get watering amounts and intervals tuned to Thailand's hot, rainy and cool seasons",
      features: ["Seasonal watering amounts", "Real-time plant health check", "Reminders when care is due"],
      linkText: "Go to My Garden",
    },
    today: {
      badge: "Daily checklist",
      title: "📅 Daily care tasks with logging",
      description:
        "A daily checklist for watering, loosening soil and fertilizing, with 1-click logging and a streak to keep you consistent",
      features: ["Today's Task Checklist", "1-click watering log", "Consistency streak"],
      linkText: "Check today's tasks",
    },
    inquiry: {
      badge: "Contact the shop instantly",
      title: "💬 Ask questions & request quotes via LINE OA",
      description:
        "Reach our experts directly. Your request gets an automatic reference code so it can be tracked professionally",
      features: ["Automatic tracking ref code", "Send plant details in one click", "Chat through LINE OA"],
      linkText: "Open the inquiry form",
    },
  },
};
