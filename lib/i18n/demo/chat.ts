import type { Copy } from "./types";

export const chatTh = {
  title: "💬 ผู้ช่วยตอบคำถาม 24 ชม. (AI Botanical Assistant)",
  subtitle: "ถาม-ตอบปัญหาการปลูก การดูแล และสูตรผสมดินด้วยระบบ AI ผู้เชี่ยวชาญพฤกษศาสตร์",
  clear: "ล้างบทสนทนา",
  popular: "คำถามยอดนิยม (คลิกเพื่อทดสอบตอบทันที):",
  related: "พันธุ์ไม้ที่เกี่ยวข้องในร้าน:",
  placeholder: "พิมพ์คำถามเกี่ยวกับการดูแลต้นไม้ สูตรผสมดิน หรืออาการใบ...",
  send: "ส่งคำถาม",
  now: "ตอนนี้",
  welcome:
    "สวัสดีครับ! ผมคือผู้ช่วยพฤกษศาสตร์ AI จาก TreeForLife 🌿 ยินดีให้คำแนะนำเรื่องการเลือกพันธุ์ไม้ สูตรผสมดิน และการแก้ปัญหาพืชตลอด 24 ชั่วโมง ลองคลิกเลือกคำถามยอดนิยมด้านล่างหรือพิมพ์คำถามได้เลยครับ",
  fallback_answer:
    'ขอบคุณสำหรับคำถามเรื่อง "{query}" ครับ! สำหรับข้อสงสัยนี้ แนะนำให้สังเกตสภาพแสงและระดับความชื้นในดินเป็นหลัก พืชส่วนใหญ่ในร่มต้องการแสงสว่างทางอ้อม 4-6 ชม. และรดน้ำเมื่อผิวดินแห้ง 1-2 นิ้ว หากต้องการคำแนะนำเจาะจงเพิ่มเติม สามารถทักหาทีมผู้เชี่ยวชาญของร้านผ่าน LINE ได้เลยครับ!',
  fallback_plant: { name: "มอนสเตอร่าเดลิซิโอซา", slug: "monstera-deliciosa", price: "450฿" },
  presets: [
    {
      keywords: ["แอร์", "ห้องนอน"],
      chipLabel: "ห้องนอนเปิดแอร์ทั้งคืน ปลูกต้นอะไรดี?",
      fullQuestion: "ห้องนอนเปิดแอร์ทั้งคืน ปลูกต้นอะไรดี?",
      answerText:
        "สำหรับห้องนอนที่เปิดเครื่องปรับอากาศทั้งคืน อุณหภูมิจะอยู่ที่ประมาณ 22-25°C และความชื้นสัมพัทธ์ในอากาศค่อนข้างต่ำ แนะนำให้เลือกพันธุ์ไม้ที่มีกระบวนการสังเคราะห์แสงแบบ CAM (Crassulacean Acid Metabolism) ซึ่งจะปิดปากใบในเวลากลางวันเพื่อลดการสูญเสียน้ำ และเปิดปากใบในเวลากลางคืนเพื่อดูดซับก๊าซคาร์บอนไดออกไซด์พร้อมปล่อยออกซิเจนบริสุทธิ์\n\n🌿 พันธุ์ไม้แนะนำอันดับ 1: ลิ้นมังกร (Sansevieria Trifasciata) ทนต่อลมแห้งจากแอร์ ดูแลง่ายมาก รดน้ำเพียง 10-14 วันครั้ง\n🌿 ทางเลือกเสริม: กวักมรกต (ZZ Plant) หรือ พลูด่าง ช่วยฟอกสารอินทรีย์ระเหยง่าย (VOCs)",
      suggestedPlants: [
        { name: "ลิ้นมังกร (Sansevieria)", slug: "sansevieria-trifasciata", price: "250฿" },
        { name: "กวักมรกต (ZZ Plant)", slug: "zamioculcas-zamiifolia-green", price: "290฿" },
      ],
    },
    {
      keywords: ["ดิน", "มอนสเตอร่า"],
      chipLabel: "สูตรผสมดินโปร่งสำหรับมอนสเตอร่า?",
      fullQuestion: "สูตรผสมดินโปร่งสำหรับมอนสเตอร่า?",
      answerText:
        "มอนสเตอร่าเป็นพืชในตระกูล Araceae ที่มีถิ่นกำเนิดในป่าดิบชื้น รากต้องการทั้งความชื้นและออกซิเจนสูง ดินปลูกที่ดีจึงต้องระบายน้ำและอากาศได้อย่างรวดเร็ว (High Aeration & Drainage) เพื่อป้องกันรากเน่า\n\n🌱 สูตรผสมดินโปร่งแนะนำ (สัดส่วน 40:30:20:10):\n1. กาบมะพร้าวสับเล็ก (แช่น้ำ 3 คืนล้างแทนนิน): 40%\n2. หินภูเขาไฟ หรือ เพอร์ไลต์: 30% (สร้างช่องว่างให้ออกซิเจนแทรกซึม)\n3. ใบก้ามปูหมักร่อนละเอียด: 20% (ให้ธาตุอาหารไนโตรเจนธรรมชาติ)\n4. มูลไส้เดือน + ปุ๋ยละลายช้า Osmocote: 10% (บำรุงต่อเนื่อง 3 เดือน)",
      suggestedPlants: [
        { name: "มอนสเตอร่าเดลิซิโอซา", slug: "monstera-deliciosa", price: "450฿" },
        { name: "มอนสเตอร่าด่าง (Albo)", slug: "monstera-albo-variegata", price: "1,800฿" },
      ],
    },
    {
      keywords: ["ม้วน"],
      chipLabel: "ใบม้วนตอนบ่ายเป็นสัญญาณอะไรไหม?",
      fullQuestion: "ใบม้วนตอนบ่ายเป็นสัญญาณอะไรไหม?",
      answerText:
        "อาการใบม้วนเข้าด้านใน (Inward Leaf Curling) ในช่วงบ่าย เป็นกลไกการปรับตัวตามธรรมชาติของพืชในการลดพื้นที่ผิวสัมผัสความร้อนและชะลออัตราการคายน้ำ (Transpiration Stress)\n\n☀️ สาเหตุที่พบบ่อย:\n1. ได้รับความร้อนหรือแดดบ่ายตรงแรงเกินไป จนรากดูดน้ำส่งขึ้นมาเลี้ยงไม่ทัน\n2. ความชื้นในดินไม่พอ ตรวจสอบโดยใช้ไม้จิ้มฟันหรือนิ้วมือตรวจลึก 2 นิ้ว\n3. โดนลมแอร์เป่าลงใบโดยตรง\n\n💡 วิธีแก้ไข: ย้ายหลบแดดตรง หรือฉีดละอองน้ำรอบทรงพุ่มเพื่อเพิ่มความชื้นสัมพัทธ์ในอากาศ",
      suggestedPlants: [
        { name: "ยางอินเดีย (Rubber Tree)", slug: "ficus-elastica-burgundy", price: "390฿" },
        { name: "ไทรใบสัก (Ficus Lyrata)", slug: "ficus-lyrata", price: "550฿" },
      ],
    },
    {
      keywords: ["จานรอง", "น้ำขัง"],
      chipLabel: "รดน้ำแล้วน้ำขังจานรองทำยังไง?",
      fullQuestion: "รดน้ำแล้วน้ำขังจานรองทำยังไง?",
      answerText:
        "น้ำที่ขังในจานรองเกิน 15-30 นาทีเป็นสาเหตุอันดับหนึ่งของโรครากเน่า (Root Rot) ในไม้กระถางในร่ม!\n\n🚿 แนวทางปฏิบัติที่ถูกต้อง:\n1. เทน้ำทิ้งเสมอ: หลังรดน้ำ 15-20 นาที ให้นำน้ำที่ซึมลงจานรองไปเททิ้งทุกครั้ง\n2. ใช้ก้อนกรวดรองก้นจาน: ใส่เม็ดดินเผาหรือหินกรวดลงในจานรอง เพื่อยกระดับก้นกระถางไม่ให้สัมผัสน้ำโดยตรง\n3. ตรวจสอบรูระบายก้นกระถางไม่ให้อุดตัน",
      suggestedPlants: [{ name: "ลิ้นมังกร (Sansevieria)", slug: "sansevieria-trifasciata", price: "250฿" }],
    },
  ],
};

export const chatEn: Copy<typeof chatTh> = {
  title: "💬 24/7 AI Botanical Assistant",
  subtitle: "Ask about planting, care and potting mixes and get answers from a botanical AI expert",
  clear: "Clear chat",
  popular: "Popular questions (click to get an instant answer):",
  related: "Related plants in the shop:",
  placeholder: "Ask about plant care, potting mixes or leaf symptoms...",
  send: "Send",
  now: "now",
  welcome:
    "Hi! I'm the TreeForLife botanical AI assistant 🌿 I can help you choose plants, mix soil and solve plant problems 24/7. Pick a popular question below or type your own.",
  fallback_answer:
    'Thanks for asking about "{query}"! Start by checking the light and soil moisture: most indoor plants want 4-6 hours of bright indirect light and should be watered when the top 1-2 inches of soil are dry. For specific advice, message our experts on LINE!',
  fallback_plant: { name: "Monstera Deliciosa", slug: "monstera-deliciosa", price: "฿450" },
  presets: [
    {
      keywords: ["air-con", "aircon", "air con", "bedroom"],
      chipLabel: "Which plant for a bedroom with air-con all night?",
      fullQuestion: "Which plant for a bedroom with air-con all night?",
      answerText:
        "A bedroom with the air-conditioner on all night sits around 22-25°C with fairly low humidity. Choose plants with CAM photosynthesis (Crassulacean Acid Metabolism): they close their stomata by day to save water and open them at night to take in CO₂ and release fresh oxygen.\n\n🌿 Top pick: Snake plant (Sansevieria Trifasciata) — handles dry air-con air, very easy, water only every 10-14 days\n🌿 Alternatives: ZZ plant or pothos, which help filter volatile organic compounds (VOCs)",
      suggestedPlants: [
        { name: "Snake plant (Sansevieria)", slug: "sansevieria-trifasciata", price: "฿250" },
        { name: "ZZ plant", slug: "zamioculcas-zamiifolia-green", price: "฿290" },
      ],
    },
    {
      keywords: ["soil", "mix", "monstera"],
      chipLabel: "An airy potting mix for Monstera?",
      fullQuestion: "An airy potting mix for Monstera?",
      answerText:
        "Monstera is an aroid (Araceae) from tropical rainforests. Its roots need both moisture and plenty of oxygen, so the mix must drain and breathe fast (high aeration & drainage) to prevent root rot.\n\n🌱 Recommended airy mix (40:30:20:10):\n1. Small coco chips (soaked 3 nights to wash out tannins): 40%\n2. Pumice or perlite: 30% (air pockets for oxygen)\n3. Sifted composted rain-tree leaves: 20% (natural nitrogen)\n4. Worm castings + Osmocote slow-release fertilizer: 10% (feeds for 3 months)",
      suggestedPlants: [
        { name: "Monstera Deliciosa", slug: "monstera-deliciosa", price: "฿450" },
        { name: "Variegated Monstera (Albo)", slug: "monstera-albo-variegata", price: "฿1,800" },
      ],
    },
    {
      keywords: ["curl", "curling"],
      chipLabel: "Leaves curl in the afternoon — is that a sign?",
      fullQuestion: "Leaves curl in the afternoon — is that a sign?",
      answerText:
        "Inward leaf curling in the afternoon is the plant's natural way of reducing the surface exposed to heat and slowing water loss (transpiration stress).\n\n☀️ Common causes:\n1. Too much heat or direct afternoon sun, so the roots can't keep up\n2. Not enough soil moisture — check 2 inches deep with a toothpick or finger\n3. Air-con blowing straight onto the leaves\n\n💡 Fix: move it out of direct sun, or mist around the canopy to raise humidity",
      suggestedPlants: [
        { name: "Rubber tree", slug: "ficus-elastica-burgundy", price: "฿390" },
        { name: "Fiddle-leaf fig (Ficus Lyrata)", slug: "ficus-lyrata", price: "฿550" },
      ],
    },
    {
      keywords: ["saucer", "standing water"],
      chipLabel: "Water pools in the saucer after watering — what now?",
      fullQuestion: "Water pools in the saucer after watering — what now?",
      answerText:
        "Water left in the saucer for more than 15-30 minutes is the number-one cause of root rot in indoor pots!\n\n🚿 Do this instead:\n1. Always empty it: 15-20 minutes after watering, pour away whatever drained into the saucer\n2. Add pebbles: fill the saucer with clay balls or gravel so the pot sits above the water\n3. Make sure the drainage holes aren't blocked",
      suggestedPlants: [{ name: "Snake plant (Sansevieria)", slug: "sansevieria-trifasciata", price: "฿250" }],
    },
  ],
};
