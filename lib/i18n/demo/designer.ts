import type { Copy } from "./types";

type Assessment = {
  lightStatusLabel: string;
  potSizeRecommended: string;
  potTypeRecommended: string;
  advice: string;
};

export const designerTh = {
  title: "🏡 ออกแบบมุมสวน AI (AI Garden Corner Designer)",
  subtitle: "ระบบจำลองการจัดวางพันธุ์ไม้และประเมินความเหมาะสมของสภาพแวดล้อมเสมือนจริง",
  step_space: "1. เลือกพื้นที่จำลอง (Select Space):",
  step_species: "2. เลือกพันธุ์ไม้ที่ต้องการจัดวาง (Select Plant Species):",
  compare_label: "ภาพจำลอง Before / After เปรียบเทียบมุมจัดวาง:",
  after_percent: "แสดงมุมมอง After: {percent}%",
  before_badge: "Before: พื้นที่ว่างเปล่าก่อนจัด",
  after_badge: "After: AI จัดวางต้นไม้และกระถางเข้ามุม",
  after_detail: "จับคู่กระถาง {pot} · สไตล์ {style}",
  slider_label: "แถบเลื่อนเปรียบเทียบ Before / After",
  view_before: "← ดู Before 100%",
  view_half: "เปรียบเทียบกึ่งกลาง (50 / 50)",
  view_after: "ดู After สมบูรณ์ 100% →",
  suitability: "การประเมินความเหมาะสมของสภาพแวดล้อม (Environmental Suitability)",
  light_match: "ความเหมาะสมของแสง: {percent}%",
  light_level: "ระดับแสงในพื้นที่:",
  verdict: "ผลประเมิน: {label}",
  pot_size: "ขนาดกระถางแนะนำ:",
  pot_material: "วัสดุกระถาง: {material}",
  advice: "💡 คำแนะนำการจัดวางโดย AI: ",
  spaces: {
    "living-room": {
      title: "มุมห้องนั่งเล่นข้างโซฟา",
      subtitle: "พื้นที่ในร่ม แสงรำไรผ่านม่านโปร่ง",
      lightingDetail: "แสงสว่างทางอ้อม 3-4 ชม./วัน (เลี่ยงแดดตรง)",
      airflowDetail: "อากาศหมุนเวียนปานกลาง มีเครื่องปรับอากาศบางช่วง",
      dimension: "พื้นที่ว่าง 1.2 x 0.8 เมตร",
    },
    balcony: {
      title: "ระเบียงรับแดดบ่าย",
      subtitle: "พื้นที่กึ่งภายนอก ทิศตะวันตก/ใต้",
      lightingDetail: "แดดส่องตรงช่วงบ่าย 4-6 ชม./วัน (ความเข้มสูง)",
      airflowDetail: "ลมธรรมชาติพัดผ่านถ่ายเทสะดวก",
      dimension: "พื้นที่ระเบียง 2.0 x 1.0 เมตร",
    },
  },
  species: {
    "monstera-albo": "มอนสเตอร่าด่าง",
    "ficus-lyrata": "ไทรใบสัก",
    sansevieria: "ลิ้นมังกร",
  },
  assessments: {
    "living-room": {
      "monstera-albo": {
        lightStatusLabel: "เหมาะสมดีเยี่ยม (แสงรำไรถนอมรอยด่าง)",
        potSizeRecommended: "10 - 12 นิ้ว",
        potTypeRecommended: "กระถางเซรามิกสีทราย หรือ ดินเผาเคลือบด้าน",
        advice:
          "ตำแหน่งข้างโซฟาได้รับแสงสว่างทางอ้อมที่ดี รอยด่างสีขาวจะไม่ไหม้เกรียม ควรหมุนกระถาง 90° ทุก 2 สัปดาห์เพื่อให้พุ่มใบสมดุล",
      },
      "ficus-lyrata": {
        lightStatusLabel: "เหมาะสมปานกลาง (ต้องการแสงสว่างเพิ่ม)",
        potSizeRecommended: "12 - 14 นิ้ว",
        potTypeRecommended: "กระถางดินเผาปากกว้างทรงกระบอก",
        advice:
          "ควรขยับให้ชิดขอบหน้าต่างหรือเปิดม่านรับแสงธรรมชาติให้มากที่สุด เพื่อป้องกันอาการใบล่างเหลืองร่วงจากแสงไม่พอ",
      },
      sansevieria: {
        lightStatusLabel: "สมบูรณ์แบบ (ทนทานต่อแสงน้อยและแอร์)",
        potSizeRecommended: "8 - 10 นิ้ว",
        potTypeRecommended: "กระถางไฟเบอร์ซีเมนต์ หรือ เซรามิกทรงมินิมอล",
        advice:
          "ทนทานต่อสภาพอากาศแห้งจากเครื่องปรับอากาศได้ดีเยี่ยม ช่วยฟอกอากาศและปล่อยออกซิเจนขณะพักผ่อน รดน้ำ 10-14 วันครั้ง",
      },
    },
    balcony: {
      "monstera-albo": {
        lightStatusLabel: "ต้องระวัง (แดดบ่ายแรงเกินไป)",
        potSizeRecommended: "12 - 14 นิ้ว",
        potTypeRecommended: "กระถางพลาสติกหนา พร้อมจานรองน้ำ",
        advice:
          "แสงแดดบ่ายตรงๆ จะทำให้เนื้อเยื่อใบส่วนสีขาวด่างไหม้แห้งกรอบได้ แนะนำให้ขยับเข้าใต้ชายคาหรือขึงสแลนกรองแสง 50%",
      },
      "ficus-lyrata": {
        lightStatusLabel: "เหมาะสมดีเยี่ยม (ชอบแดดและลมโกรก)",
        potSizeRecommended: "14 - 16 นิ้ว",
        potTypeRecommended: "กระถางดินเผาหนา ทรงสูงระบายน้ำดี",
        advice:
          "ระเบียงที่มีลมโกรกและแดดส่องช่วยให้ลำต้นแข็งแรง ใบไม่บวมน้ำหรือเป็นจุดดำ ดินแห้งเร็วลดความเสี่ยงรากเน่าได้ดีเยี่ยม",
      },
      sansevieria: {
        lightStatusLabel: "ดีมาก (ทนแดดทนฝน)",
        potSizeRecommended: "8 - 10 นิ้ว",
        potTypeRecommended: "กระถางดินเผาธรรมชาติมีรูระบาย",
        advice:
          "ปรับตัวรับแดดระเบียงได้ดีมาก ลำต้นจะแน่นหนา แข็งแรง ในฤดูฝนควรระวังไม่ให้น้ำขังในจานรองเกิน 24 ชม.",
      },
    },
  } as Record<string, Record<string, Assessment>>,
  fallback: {
    lightStatusLabel: "เหมาะสม",
    potSizeRecommended: "10-12 นิ้ว",
    potTypeRecommended: "กระถางดินเผา",
    advice: "จัดวางในตำแหน่งที่ได้รับแสงสว่างทางอ้อม",
  } as Assessment,
};

export const designerEn: Copy<typeof designerTh> = {
  title: "🏡 AI Garden Corner Designer",
  subtitle: "Simulate placing plants in a space and get a virtual assessment of how well the environment suits them",
  step_space: "1. Select a space:",
  step_species: "2. Select a plant species to place:",
  compare_label: "Before / After comparison of the corner:",
  after_percent: "Showing After: {percent}%",
  before_badge: "Before: the empty space",
  after_badge: "After: AI places the plant and pot",
  after_detail: "Matched pot {pot} · {style} style",
  slider_label: "Before / After comparison slider",
  view_before: "← View Before 100%",
  view_half: "Compare 50 / 50",
  view_after: "View full After 100% →",
  suitability: "Environmental Suitability",
  light_match: "Light match: {percent}%",
  light_level: "Light in this space:",
  verdict: "Assessment: {label}",
  pot_size: "Recommended pot size:",
  pot_material: "Pot material: {material}",
  advice: "💡 AI placement advice: ",
  spaces: {
    "living-room": {
      title: "Living-room corner by the sofa",
      subtitle: "Indoors, filtered light through sheer curtains",
      lightingDetail: "Bright indirect light 3-4 h/day (no direct sun)",
      airflowDetail: "Moderate airflow, air-conditioning at times",
      dimension: "Free area 1.2 x 0.8 m",
    },
    balcony: {
      title: "Balcony with afternoon sun",
      subtitle: "Semi-outdoor, facing west/south",
      lightingDetail: "Direct afternoon sun 4-6 h/day (high intensity)",
      airflowDetail: "Natural breeze, good ventilation",
      dimension: "Balcony area 2.0 x 1.0 m",
    },
  },
  species: {
    "monstera-albo": "Variegated Monstera",
    "ficus-lyrata": "Fiddle-leaf fig",
    sansevieria: "Snake plant",
  },
  assessments: {
    "living-room": {
      "monstera-albo": {
        lightStatusLabel: "Excellent (filtered light protects the variegation)",
        potSizeRecommended: "10 - 12 inches",
        potTypeRecommended: "Sand-coloured ceramic or matte-glazed terracotta",
        advice:
          "The spot by the sofa gets good indirect light, so the white variegation won't scorch. Rotate the pot 90° every 2 weeks for a balanced canopy.",
      },
      "ficus-lyrata": {
        lightStatusLabel: "Fair (needs more light)",
        potSizeRecommended: "12 - 14 inches",
        potTypeRecommended: "Wide cylindrical terracotta pot",
        advice:
          "Move it right up to the window or open the curtains as much as possible to stop the lower leaves yellowing and dropping from low light.",
      },
      sansevieria: {
        lightStatusLabel: "Perfect (tolerates low light and air-con)",
        potSizeRecommended: "8 - 10 inches",
        potTypeRecommended: "Fibre-cement or minimalist ceramic pot",
        advice:
          "Handles dry air-conditioned rooms extremely well, purifies the air and releases oxygen at night. Water every 10-14 days.",
      },
    },
    balcony: {
      "monstera-albo": {
        lightStatusLabel: "Caution (afternoon sun is too strong)",
        potSizeRecommended: "12 - 14 inches",
        potTypeRecommended: "Thick plastic pot with a saucer",
        advice:
          "Direct afternoon sun will scorch the white variegated tissue. Move it under the eaves or put up 50% shade cloth.",
      },
      "ficus-lyrata": {
        lightStatusLabel: "Excellent (loves sun and breeze)",
        potSizeRecommended: "14 - 16 inches",
        potTypeRecommended: "Thick, tall terracotta pot with good drainage",
        advice:
          "Breeze and sun make the trunk sturdy and keep leaves free of edema and black spots; fast-drying soil greatly reduces root-rot risk.",
      },
      sansevieria: {
        lightStatusLabel: "Very good (handles sun and rain)",
        potSizeRecommended: "8 - 10 inches",
        potTypeRecommended: "Natural terracotta pot with drainage holes",
        advice:
          "Adapts very well to balcony sun and grows dense and sturdy. In the rainy season don't let water sit in the saucer for more than 24 hours.",
      },
    },
  },
  fallback: {
    lightStatusLabel: "Suitable",
    potSizeRecommended: "10-12 inches",
    potTypeRecommended: "Terracotta pot",
    advice: "Place it where it gets bright indirect light",
  },
};
