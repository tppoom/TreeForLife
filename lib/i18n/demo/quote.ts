import type { Copy } from "./types";

type Sun = "full" | "partial" | "shade";

export const quoteTh = {
  title: "📋 ขอใบเสนอราคาจัดสวน",
  subtitle:
    "ระบบประเมินราคาจัดสวนและปรับภูมิทัศน์เบื้องต้น คำนวณตามขนาดพื้นที่ ทิศทางแสงแดด และสไตล์ที่คุณต้องการ พร้อมเชื่อมต่อทีมภูมิสถาปัตย์ผ่าน LINE",
  response_label: "Est. Response",
  response_value: "แบบ 3D ใน 2 ชม.",
  area_label: "ขนาดพื้นที่สวน (ตร.ม.)",
  area_value: "{size} ตร.ม.",
  area_min: "5 ตร.ม. (กะทัดรัด)",
  area_mid: "75 ตร.ม.",
  area_max: "150 ตร.ม. (กว้างขวาง)",
  area_chips: ["15 ตร.ม. (ระเบียง)", "30 ตร.ม. (ข้างบ้าน)", "60 ตร.ม. (หลังบ้าน)"],
  sun_label: "สภาพแสงแดดประจำวัน",
  sun: {
    full: { label: "แดดเต็มวัน", sub: "6+ ชม./วัน" },
    partial: { label: "แดดรำไร", sub: "3-5 ชม./กรองแสง" },
    shade: { label: "ในร่ม", sub: "ใต้ชายคา/ในบ้าน" },
  },
  style_label: "สไตล์สวนที่ชื่นชอบ",
  styles: {
    "Minimal Zen": {
      name: "Minimal Zen (มินิมอลเซน)",
      description: "เรียบสงบ สบายตา หินแม่น้ำ สนใบพาย ไผ่เลี้ยง และทางเดินแผ่นหิน",
      plants: {
        full: ["สนใบพายทรงพุ่ม", "ไผ่เลี้ยงแคระ", "หญ้ามาเลเซีย", "สนมังกรแคระ"],
        partial: ["ไผ่ฟิลิปปินส์", "จั๋งเชียงใหม่", "หินแม่น้ำตกแต่ง", "มอสสด"],
        shade: ["ลิ้นมังกรคัดฟอร์ม", "จั๋งญี่ปุ่นแคระ", "หินเซนและกรวดขาวแม่น้ำ"],
      },
    },
    "English Cottage": {
      name: "English Cottage (อิงลิชคอทเทจ)",
      description: "อบอุ่น หวานละมุน ซุ้มไม้ดอก กุหลาบ สมุนไพรฝรั่ง และขอบแปลงอิฐดินเผา",
      plants: {
        full: ["กุหลาบอังกฤษ Clair Austin", "ไฮเดรนเยีย", "โรสแมรี่", "บลูซัลเวีย"],
        partial: ["กุหลาบหิน", "ฟอร์เก็ตมีน็อต", "เฟิร์นขนนก", "ลาเวนเดอร์พุ่ม"],
        shade: ["กุหลาบหินกระถางอบอุ่น", "ไอวี่เลื้อยด่าง", "บีโกเนียดอกดก"],
      },
    },
    "Modern Tropical": {
      name: "Modern Tropical (โมเดิร์นทรอปิคอล)",
      description: "เขียวชอุ่ม ร่มรื่นสไตล์รีสอร์ต มอนสเตอร่า ฟิโลเดนดรอน ปาล์ม และไม้ใบใหญ่",
      plants: {
        full: ["ปาล์มพัด", "เฮลิโคเนียก้ามกุ้ง", "เบิร์ดออฟพาราไดซ์", "จันผา"],
        partial: ["มอนสเตอร่าไจแอนท์", "ฟิโลเดนดรอนก้านส้ม", "ยางอินเดีย", "เฟิร์นข้าหลวง"],
        shade: ["มอนสเตอร่าเดลิซิโอซา", "กวักมรกต", "เดหลีใบด่าง", "เขียวหมื่นปี"],
      },
    },
  } as Record<string, { name: string; description: string; plants: Record<Sun, string[]> }>,
  addons: "บริการเสริมพิเศษ (Add-on Services):",
  irrigation: "ระบบรดน้ำอัตโนมัติ (+฿4,500)",
  lighting: "ระบบไฟตกแต่งสวนโซลาร์เซลล์ (+฿3,200)",
  estimate: "ประเมินราคา",
  calculated: "คำนวณสำเร็จพร้อมใช้งาน",
  quote_title: "ใบเสนอราคาเบื้องต้น (Preliminary Quotation)",
  reference: "รหัสอ้างอิง: {code} • ใช้เป็นกรอบงบประมาณเบื้องต้น",
  grand_total: "ประเมินรวมทั้งสิ้น",
  plant_cost: "1. ค่าพันธุ์ไม้",
  plant_cost_desc: "รวมไม้ประธาน ไม้พุ่ม ไม้คลุมดิน ตามสภาพ {sun}",
  soil_cost: "2. ค่าปรับหน้าดิน/วัสดุปลูก",
  soil_cost_desc: "ดินปลูกอินทรีย์, กาบมะพร้าว, หินระบายน้ำ และปุ๋ยรองก้นหลุม",
  labor_cost: "3. ค่าแรงและติดตั้ง",
  labor_cost_desc: "ทีมช่างจัดสวนผู้ชำนาญการ ขุดหลุม ปลูก ยึดค้ำยัน และเก็บกวาด",
  warranty: "4. การรับประกันดูแล 30 วัน",
  warranty_value: "ฟรี รวมในแพ็กเกจ",
  warranty_desc: "เข้าตรวจสภาพต้นไม้ 2 ครั้ง เคลมเปลี่ยนต้นไม้ใหม่ฟรีหากมีอาการชะงัก",
  recommended: "พันธุ์ไม้แนะนำประจำสเปก ({style} • {sun}):",
  line_title: "ปรึกษาภูมิสถาปนิกผ่าน LINE Official",
  line_desc: "ส่งข้อมูลพื้นที่ {size} ตร.ม. พร้อมสเปกนี้เพื่อให้ทีมออกแบบร่างแบบ 3D แพลนเนอร์",
  line_send: "ส่งข้อมูลผ่าน LINE (@TreeForLife)",
  line_sent:
    "จำลองการส่งข้อมูลเรียบร้อยแล้ว! ข้อมูลใบเสนอราคา {code} ถูกเตรียมส่งเข้า LINE Official สำหรับเจ้าหน้าที่ภูมิสถาปัตย์ติดต่อกลับ",
};

export const quoteEn: Copy<typeof quoteTh> = {
  title: "📋 Request a Garden Design Quote",
  subtitle:
    "A preliminary landscaping estimate based on area, sunlight and your preferred style, with a direct line to our landscape architects on LINE",
  response_label: "Est. Response",
  response_value: "3D design in 2 h",
  area_label: "Garden area (m²)",
  area_value: "{size} m²",
  area_min: "5 m² (compact)",
  area_mid: "75 m²",
  area_max: "150 m² (spacious)",
  area_chips: ["15 m² (balcony)", "30 m² (side yard)", "60 m² (backyard)"],
  sun_label: "Daily sunlight",
  sun: {
    full: { label: "Full sun", sub: "6+ h/day" },
    partial: { label: "Partial sun", sub: "3-5 h / filtered" },
    shade: { label: "Shade", sub: "Under eaves / indoors" },
  },
  style_label: "Preferred garden style",
  styles: {
    "Minimal Zen": {
      name: "Minimal Zen",
      description: "Calm and soothing: river stones, podocarpus, bamboo and stepping-stone paths",
      plants: {
        full: ["Bushy podocarpus", "Dwarf bamboo", "Malaysian grass", "Dwarf dragon pine"],
        partial: ["Philippine bamboo", "Lady palm", "Decorative river stones", "Fresh moss"],
        shade: ["Select-form snake plant", "Dwarf Japanese lady palm", "Zen stones and white river gravel"],
      },
    },
    "English Cottage": {
      name: "English Cottage",
      description: "Warm and romantic: flower arches, roses, herbs and terracotta brick borders",
      plants: {
        full: ["Claire Austin English rose", "Hydrangea", "Rosemary", "Blue salvia"],
        partial: ["Portulaca", "Forget-me-not", "Asparagus fern", "Bushy lavender"],
        shade: ["Potted portulaca", "Variegated trailing ivy", "Free-flowering begonia"],
      },
    },
    "Modern Tropical": {
      name: "Modern Tropical",
      description: "Lush resort-style shade: Monstera, philodendrons, palms and big-leaved plants",
      plants: {
        full: ["Fan palm", "Lobster-claw heliconia", "Bird of paradise", "Dracaena loureiri"],
        partial: ["Giant Monstera", "Orange-stem philodendron", "Rubber tree", "Bird's nest fern"],
        shade: ["Monstera Deliciosa", "ZZ plant", "Variegated peace lily", "Aglaonema"],
      },
    },
  },
  addons: "Add-on services:",
  irrigation: "Automatic irrigation (+฿4,500)",
  lighting: "Solar garden lighting (+฿3,200)",
  estimate: "Get estimate",
  calculated: "Estimate ready",
  quote_title: "Preliminary Quotation",
  reference: "Reference: {code} • Use as an initial budget frame",
  grand_total: "Estimated total",
  plant_cost: "1. Plants",
  plant_cost_desc: "Feature trees, shrubs and ground cover for {sun}",
  soil_cost: "2. Soil preparation & media",
  soil_cost_desc: "Organic soil, coco husk, drainage stones and base fertilizer",
  labor_cost: "3. Labour & installation",
  labor_cost_desc: "Expert gardeners: digging, planting, staking and clean-up",
  warranty: "4. 30-day care warranty",
  warranty_value: "Free, included",
  warranty_desc: "2 check-up visits and free replacement of any plant that fails to establish",
  recommended: "Recommended plants for this spec ({style} • {sun}):",
  line_title: "Talk to a landscape architect on LINE Official",
  line_desc: "Send your {size} m² area and this spec so our team can draft a 3D plan",
  line_send: "Send via LINE (@TreeForLife)",
  line_sent:
    "Simulated send complete! Quotation {code} is ready to go to LINE Official so a landscape architect can contact you.",
};
