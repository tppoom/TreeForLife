import type { Copy } from "./types";

type Item = { name: string; nameEn: string; potSize: string; highlight: string };
type Bundle = { styleName: string; curatorNote: string; placementTips: string; items: Item[] };

export const budgetTh = {
  title: "💰 โหมดงบเท่านี้ (Budget Plant Recommender)",
  subtitle: "จัดเซ็ตต้นไม้และอุปกรณ์ดูแลให้คุ้มค่าที่สุดตามงบประมาณที่คุณกำหนด",
  budget_label: "กำหนดงบประมาณที่คุณต้องการ (Budget Range):",
  budget_value: "งบประมาณ: {amount} บาท",
  slider_label: "งบประมาณที่คุณต้องการ",
  min: "500 ฿ (ขั้นต่ำ)",
  mid: "2,500 ฿",
  max: "5,000 ฿ (สูงสุด)",
  quick: "งบลัด:",
  quick_presets: ["800฿ (ชุดเริ่มต้น)", "1,500฿ (ยอดนิยม)", "3,000฿ (จัดเต็มมุมห้อง)", "5,000฿ (คอมโบพรีเมียม)"],
  style_label: "เลือกสไตล์และบรรยากาศที่คุณชอบ:",
  styles: {
    minimal: { label: "มินิมอลโมเดิร์น (Minimal)", desc: "รูปทรงเรียบหรู ดูแลง่าย เข้ากับบ้านสมัยใหม่" },
    tropical: { label: "ทรอปิคอลคาเฟ่ (Tropical Cafe)", desc: "ใบฉลุ ฟอร์มป่าดิบชื้น สร้างบรรยากาศคาเฟ่" },
    "air-purifier": { label: "ไม้ฟอกอากาศเลี้ยงง่าย (Air Purifier)", desc: "ดูดซับสารพิษ คายออกซิเจน ทนต่อห้องแอร์" },
  },
  curated_for_you: "เซ็ตที่คัดสรรให้คุณ:",
  total_label: "รวมงบประมาณที่ใช้:",
  total: "รวมงบประมาณ {amount} ฿",
  remaining: "(เหลืองบ {amount} ฿)",
  items_label: "รายการพันธุ์ไม้และอุปกรณ์ในชุดนี้ ({count} รายการ):",
  highlight: "จุดเด่น: {text}",
  why: "เหตุผลที่คัดสรรเซ็ตนี้:",
  placement: "คำแนะนำการจัดวาง:",
  price_note: "💡 ราคานี้รวมการจัดเตรียมวัสดุปลูกและบรรจุห่อกันกระแทกอย่างดี",
  order: "สั่งซื้อเซ็ตนี้ทาง LINE OA",
  bundles: {
    minimal: [
      {
        styleName: "มินิมอลโมเดิร์น (Starter Set)",
        curatorNote: "จับคู่ไม้ใบเข้มกับไม้ทรงตั้ง ให้มิติความต่างของทรงใบในงบประหยัด",
        placementTips: "วางคู่กันบนชั้นวาง หรือวางแยกโต๊ะทำงานและข้างหน้าต่างรับแดดรำไร",
        items: [
          { name: "ลิ้นมังกรขอบทอง", nameEn: "Sansevieria Golden Hahnii", potSize: "กระถาง 6 นิ้ว", highlight: "รูปทรงคอมแพ็กต์ วางโต๊ะทำงานได้" },
          { name: "ยางอินเดียดำ", nameEn: "Rubber Plant Burgundy", potSize: "กระถาง 6 นิ้ว", highlight: "ใบสีเข้มมันเงา มินิมอลทรงพลัง" },
        ],
      },
      {
        styleName: "มินิมอลโมเดิร์น (Comfort Suite)",
        curatorNote: "ชุดคอมโบระดับยอดนิยม ผสานใบเงา ใบมินต์ และก้านตั้ง พร้อมกระถางเซรามิกเข้าเซ็ต",
        placementTips: "วางเรียง 3 ระดับข้างโซฟาห้องนั่งเล่น ช่วยเติมชีวิตชีวาให้มุมพักผ่อน",
        items: [
          { name: "ยางอินเดียดำพุ่มโต", nameEn: "Rubber Plant Burgundy", potSize: "กระถาง 8 นิ้ว", highlight: "ใบใหญ่ฟอร์มสวย ลำต้นแข็งแรง" },
          { name: "ลิ้นมังกรแสงจันทร์", nameEn: "Sansevieria Moonshine", potSize: "กระถาง 6 นิ้ว", highlight: "ใบสีเขียวมินต์นวลตา เรียบหรู" },
          { name: "กวักมรกตเขียว", nameEn: "ZZ Plant", potSize: "กระถาง 8 นิ้ว", highlight: "ก้านตั้งตรง ทนแอร์ ไม่ต้องการน้ำบ่อย" },
          { name: "กระถางเซรามิกสีทรายมินิมอล", nameEn: "Sand Ceramic Pot with Tray", potSize: "ขนาด 8 นิ้ว", highlight: "เซรามิกดินเผาเนื้อเนียน พร้อมจานรองน้ำ" },
        ],
      },
      {
        styleName: "มินิมอลโมเดิร์น (Grand Gallery Set)",
        curatorNote: "ชุดแต่งบ้านระดับสถาปัตย์ โดดเด่นด้วยไทรใบสักต้นใหญ่และงานไม้สักแท้คราฟต์มือ",
        placementTips: "เหมาะเป็นจุดเด่นประจำห้องรับแขก โถงต้อนรับ หรือมุมติดผนังปูนเปลือย",
        items: [
          { name: "ไทรใบสักฟอร์มต้นใหญ่", nameEn: "Ficus Lyrata Specimen", potSize: "กระถาง 12 นิ้ว", highlight: "จุดโฟกัสสายตา เสริมความภูมิฐานให้ห้อง" },
          { name: "ยางอินเดียด่างสามสี", nameEn: "Ficus Elastica Variegata", potSize: "กระถาง 8 นิ้ว", highlight: "ลวดลายด่างชมพู-ครีม-เขียว สะกดสายตา" },
          { name: "ลิ้นมังกรซามูไร", nameEn: "Sansevieria Samurai", potSize: "กระถาง 6 นิ้ว", highlight: "ฟอร์มใบหนาบิดเกลียวแบบสถาปัตยกรรม" },
          { name: "ชุดขาตั้งไม้สักแท้ + กระถางไฟเบอร์ซีเมนต์", nameEn: "Teak Stand & Fiber Cement Pot", potSize: "สำหรับกระถาง 12 นิ้ว", highlight: "ยกระดับต้นไม้ให้ดูโปร่ง โมเดิร์นระดับพรีเมียม" },
        ],
      },
    ],
    tropical: [
      {
        styleName: "ทรอปิคอลคาเฟ่ (Mini Jungle)",
        curatorNote: "สร้างบรรยากาศร้านกาแฟในมุมเล็ก ด้วยมอนสเตอร่าและพลูด่างห้อยระย้า",
        placementTips: "วางมอนสเตอร่าบนโต๊ะ แขวนพลูด่างข้างหน้าต่างให้กิ่งเลื้อยลงมา",
        items: [
          { name: "มอนสเตอร่าเดลิซิโอซา", nameEn: "Monstera Deliciosa", potSize: "กระถาง 6 นิ้ว", highlight: "ใบฉลุฟอร์มสวย ซิกเนเจอร์ป่าดิบชื้น" },
          { name: "พลูด่างราชินีหินอ่อน", nameEn: "Marble Queen Pothos", potSize: "กระถางแขวน 6 นิ้ว", highlight: "ใบด่างขาวลายหินอ่อน เลื้อยคลุมขอบกระถาง" },
        ],
      },
      {
        styleName: "ทรอปิคอลคาเฟ่ (Tropical Oasis)",
        curatorNote: "ดึงบรรยากาศป่าฝนเข้าสู่บ้านได้อย่างสมบูรณ์แบบ ทั้งไม้พุ่มและไม้เลื้อยพร้อมเสาค้ำ",
        placementTips: "จัดเป็นกลุ่มก้อนมุมห้องที่มีแสงรำไร ฉีดละอองน้ำช่วงเช้าเพื่อความสดชื่น",
        items: [
          { name: "มอนสเตอร่าเดลิซิโอซา พุ่มใหญ่", nameEn: "Monstera Deliciosa", potSize: "กระถาง 8 นิ้ว", highlight: "ใบฉลุลึกหลายแฉก พุ่มหนาแน่น" },
          { name: "ฟิโลเดนดรอนซานาดู", nameEn: "Philodendron Xanadu", potSize: "กระถาง 8 นิ้ว", highlight: "ใบหยักทรงพุ่มแน่น สไตล์ป่าดงดิบ" },
          { name: "เงินไหลมาด่างขาว", nameEn: "Syngonium Albo Variegata", potSize: "กระถาง 6 นิ้ว", highlight: "ด่างขาวสะดุดตา เลื้อยเกาะหลัก" },
          { name: "ชุดดินโปร่ง + เสาใยมะพร้าวค้ำทรง", nameEn: "Aroid Mix & Coco Pole", potSize: "เซ็ตดูแลไม้เลื้อย", highlight: "กาบมะพร้าวสับหมัก + เพอร์ไลต์พร้อมใช้" },
        ],
      },
      {
        styleName: "ทรอปิคอลคาเฟ่ (Collector's Rainforest)",
        curatorNote: "เซ็ตสะสมพันธุ์ไม้ด่างระดับไฮเอนด์ สำหรับผู้หลงใหลในความงามและเสน่ห์ของธรรมชาติ",
        placementTips: "วางในจุดแสงรำไร อากาศถ่ายเทดี เลี่ยงแดดบ่ายตรงเพื่อปกป้องลายด่าง",
        items: [
          { name: "มอนสเตอร่าด่างขาว Albo", nameEn: "Monstera Deliciosa Albo Variegata", potSize: "กระถาง 8 นิ้ว", highlight: "แรร์ไอเทม ลายด่างขาวกระจายทั่วใบ" },
          { name: "เสน่ห์จันทร์ประกายดาว", nameEn: "Homalomena Rubescens Variegata", potSize: "กระถาง 8 นิ้ว", highlight: "ด่างจุดชมพูประกายดาว ใบรูปหัวใจ" },
          { name: "ฟิโลเดนดรอนก้ามกุ้งด่าง", nameEn: "Philodendron Florida Beauty", potSize: "กระถาง 8 นิ้ว", highlight: "ฟอร์มใบแปลกตา ด่างเหลืองเข้ม" },
          { name: "เซ็ตอุปกรณ์ดูแล & ปุ๋ยอินทรีย์พรีเมียม", nameEn: "Care Kit & Organic Booster", potSize: "ครบชุด", highlight: "น้ำส้มควันไม้ + เชื้อราไตรโคเดอร์มา + ปุ๋ยออสโมโค้ท" },
        ],
      },
    ],
    "air-purifier": [
      {
        styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Clean Air Duo)",
        curatorNote: "คู่หูฟอกอากาศตามมาตรฐาน NASA คายออกซิเจนทั้งกลางวันและกลางคืน",
        placementTips: "วางลิ้นมังกรในห้องนอน และวางเดหลีในห้องนั่งเล่นหรือห้องน้ำที่มีแสงรำไร",
        items: [
          { name: "ลิ้นมังกรขอบเหลือง", nameEn: "Sansevieria Laurentii", potSize: "กระถาง 8 นิ้ว", highlight: "ปล่อยออกซิเจนเวลากลางคืน เลี้ยงง่ายสุด" },
          { name: "เดหลีใบมัน ดอกขาว", nameEn: "Peace Lily (Spathiphyllum)", potSize: "กระถาง 6 นิ้ว", highlight: "ฟอกไอสารเคมีจากสีทาบ้านและน้ำยาทำความสะอาด" },
        ],
      },
      {
        styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Healthy Home Trio)",
        curatorNote: "ชุดสามสหายฟอกอากาศครบวงจร ทนทานต่อเครื่องปรับอากาศ รดน้ำสัปดาห์ละครั้ง",
        placementTips: "กระจายวางตามจุดต่างๆ ของบ้าน: ห้องนอน ห้องนั่งเล่น และห้องทำงาน",
        items: [
          { name: "ลิ้นมังกรทรงสูง พุ่มแน่น", nameEn: 'Sansevieria Trifasciata 10"', potSize: "กระถาง 10 นิ้ว", highlight: "ฟอร์มสูงสง่า ดักจับฝุ่นละออง PM 2.5" },
          { name: "กวักมรกตเขียว", nameEn: "ZZ Plant", potSize: "กระถาง 8 นิ้ว", highlight: "ทนแล้ง ทนแสงน้อย ใบมันเงาขับสารพิษ" },
          { name: "เดหลีด่างฟอกอากาศ", nameEn: "Spathiphyllum Domino Variegated", potSize: "กระถาง 8 นิ้ว", highlight: "ดูดซับฟอร์มาลดีไฮด์และเบนซีน" },
          { name: "เม็ดดินเผาโรยหน้ากระถาง Popper", nameEn: "Expanded Clay Pebbles", potSize: "ถุง 2 ลิตร", highlight: "ช่วยเก็บความชื้นและกันหน้าดินกระเด็น" },
        ],
      },
      {
        styleName: "ไม้ฟอกอากาศเลี้ยงง่าย (Pure Sanctuary Suite)",
        curatorNote: "ที่สุดของการฟอกอากาศระดับพรีเมียม ผสานพันธุ์ไม้ฟอกอากาศที่ทนทานและทรงคุณค่า",
        placementTips: "เหมาะสำหรับบ้านพักอาศัยหรือคอนโดใจกลางเมืองที่ต้องการอากาศบริสุทธิ์สูงสุด",
        items: [
          { name: "ไทรใบสักทรงพุ่ม", nameEn: "Ficus Lyrata Tree", potSize: "กระถาง 12 นิ้ว", highlight: "ดักจับฝุ่นละอองในอากาศด้วยผิวใบขนาดใหญ่" },
          { name: "กวักมรกตดำด่าง Raven", nameEn: "Zamioculcas Raven Variegated", potSize: "กระถาง 8 นิ้ว", highlight: "ใบสีดำขลับตัดด่างเขียว ฟอกอากาศขั้นสูง" },
          { name: "ชุดลิ้นมังกร 3 สายพันธุ์", nameEn: "Sansevieria Triple Collector", potSize: "กระถาง 8 นิ้ว", highlight: "รวมพันธุ์ขอบทอง ซามูไร และมูนไชน์" },
          { name: "ชุดดินผสมไบโอชาร์ดูดซับสารพิษ", nameEn: "Biochar Detox Soil Mix", potSize: "ถุง 10 ลิตร", highlight: "ถ่านชีวภาพดูดซับกลิ่นอับและโลหะหนักในดิน" },
        ],
      },
    ],
  } as Record<"minimal" | "tropical" | "air-purifier", Bundle[]>,
};

export const budgetEn: Copy<typeof budgetTh> = {
  title: "💰 Budget Plant Recommender",
  subtitle: "Get the best-value set of plants and care gear for the budget you choose",
  budget_label: "Set your budget range:",
  budget_value: "Budget: {amount} THB",
  slider_label: "Your budget",
  min: "฿500 (min)",
  mid: "฿2,500",
  max: "฿5,000 (max)",
  quick: "Quick picks:",
  quick_presets: ["฿800 (starter)", "฿1,500 (popular)", "฿3,000 (full corner)", "฿5,000 (premium combo)"],
  style_label: "Choose the style and mood you like:",
  styles: {
    minimal: { label: "Modern Minimal", desc: "Clean, elegant shapes that are easy to care for" },
    tropical: { label: "Tropical Cafe", desc: "Split leaves and rainforest forms for a cafe vibe" },
    "air-purifier": { label: "Easy Air Purifiers", desc: "Absorb toxins, release oxygen, handle air-con rooms" },
  },
  curated_for_you: "Curated for you:",
  total_label: "Total spend:",
  total: "Total ฿{amount}",
  remaining: "(฿{amount} left)",
  items_label: "Plants and gear in this set ({count} items):",
  highlight: "Highlight: {text}",
  why: "Why we picked this set:",
  placement: "Placement tips:",
  price_note: "💡 Price includes potting media and careful protective packing",
  order: "Order this set on LINE OA",
  bundles: {
    minimal: [
      {
        styleName: "Modern Minimal (Starter Set)",
        curatorNote: "Pairs a dark-leaved plant with an upright one for contrasting shapes on a tight budget",
        placementTips: "Display them together on a shelf, or split between your desk and a softly lit window",
        items: [
          { name: "Golden Hahnii snake plant", nameEn: "Sansevieria Golden Hahnii", potSize: "6-inch pot", highlight: "Compact shape that fits on a desk" },
          { name: "Burgundy rubber plant", nameEn: "Rubber Plant Burgundy", potSize: "6-inch pot", highlight: "Glossy dark leaves, bold and minimal" },
        ],
      },
      {
        styleName: "Modern Minimal (Comfort Suite)",
        curatorNote: "Our most popular combo: glossy, mint and upright foliage with a matching ceramic pot",
        placementTips: "Arrange on 3 levels beside the living-room sofa to liven up your relaxing corner",
        items: [
          { name: "Bushy burgundy rubber plant", nameEn: "Rubber Plant Burgundy", potSize: "8-inch pot", highlight: "Large, well-shaped leaves and a sturdy trunk" },
          { name: "Moonshine snake plant", nameEn: "Sansevieria Moonshine", potSize: "6-inch pot", highlight: "Soft mint-green leaves, understated luxury" },
          { name: "Green ZZ plant", nameEn: "ZZ Plant", potSize: "8-inch pot", highlight: "Upright stems, tolerates air-con, rarely needs water" },
          { name: "Minimal sand-coloured ceramic pot", nameEn: "Sand Ceramic Pot with Tray", potSize: "8-inch", highlight: "Smooth glazed ceramic with a drip tray" },
        ],
      },
      {
        styleName: "Modern Minimal (Grand Gallery Set)",
        curatorNote: "An architectural set starring a large fiddle-leaf fig and handcrafted solid teak",
        placementTips: "Ideal as the focal point of a living room, entrance hall or raw-concrete wall",
        items: [
          { name: "Large fiddle-leaf fig", nameEn: "Ficus Lyrata Specimen", potSize: "12-inch pot", highlight: "A statement piece that adds presence to the room" },
          { name: "Tricolour variegated rubber plant", nameEn: "Ficus Elastica Variegata", potSize: "8-inch pot", highlight: "Eye-catching pink, cream and green variegation" },
          { name: "Samurai snake plant", nameEn: "Sansevieria Samurai", potSize: "6-inch pot", highlight: "Thick, twisting leaves with an architectural form" },
          { name: "Teak stand + fibre-cement pot", nameEn: "Teak Stand & Fiber Cement Pot", potSize: "For a 12-inch pot", highlight: "Lifts the plant for an airy, premium modern look" },
        ],
      },
    ],
    tropical: [
      {
        styleName: "Tropical Cafe (Mini Jungle)",
        curatorNote: "Creates a coffee-shop feel in a small corner with a Monstera and trailing pothos",
        placementTips: "Put the Monstera on a table and hang the pothos by a window so it trails down",
        items: [
          { name: "Monstera Deliciosa", nameEn: "Monstera Deliciosa", potSize: "6-inch pot", highlight: "Beautiful split leaves, the rainforest signature" },
          { name: "Marble Queen pothos", nameEn: "Marble Queen Pothos", potSize: "6-inch hanging pot", highlight: "White marbled leaves trailing over the rim" },
        ],
      },
      {
        styleName: "Tropical Cafe (Tropical Oasis)",
        curatorNote: "Brings the rainforest home, with bushy and climbing plants plus a support pole",
        placementTips: "Group them in a softly lit corner and mist in the morning for freshness",
        items: [
          { name: "Large bushy Monstera Deliciosa", nameEn: "Monstera Deliciosa", potSize: "8-inch pot", highlight: "Deeply split leaves, dense foliage" },
          { name: "Philodendron Xanadu", nameEn: "Philodendron Xanadu", potSize: "8-inch pot", highlight: "Lobed leaves in a dense jungle-style clump" },
          { name: "White variegated arrowhead", nameEn: "Syngonium Albo Variegata", potSize: "6-inch pot", highlight: "Striking white variegation, climbs a pole" },
          { name: "Airy mix + coco support pole", nameEn: "Aroid Mix & Coco Pole", potSize: "Climber care set", highlight: "Composted coco chips + perlite, ready to use" },
        ],
      },
      {
        styleName: "Tropical Cafe (Collector's Rainforest)",
        curatorNote: "A high-end collection of variegated plants for true lovers of natural beauty",
        placementTips: "Keep in filtered light with good airflow; avoid direct afternoon sun to protect the variegation",
        items: [
          { name: "Monstera Albo", nameEn: "Monstera Deliciosa Albo Variegata", potSize: "8-inch pot", highlight: "A rare find with white variegation across the leaves" },
          { name: "Star-speckled Homalomena", nameEn: "Homalomena Rubescens Variegata", potSize: "8-inch pot", highlight: "Pink star-like speckles on heart-shaped leaves" },
          { name: "Variegated Florida Beauty", nameEn: "Philodendron Florida Beauty", potSize: "8-inch pot", highlight: "Unusual leaf shape with deep yellow variegation" },
          { name: "Premium care kit & organic booster", nameEn: "Care Kit & Organic Booster", potSize: "Complete set", highlight: "Wood vinegar + Trichoderma + Osmocote fertilizer" },
        ],
      },
    ],
    "air-purifier": [
      {
        styleName: "Easy Air Purifiers (Clean Air Duo)",
        curatorNote: "A NASA-listed air-purifying duo that releases oxygen day and night",
        placementTips: "Snake plant in the bedroom; peace lily in a softly lit living room or bathroom",
        items: [
          { name: "Yellow-edged snake plant", nameEn: "Sansevieria Laurentii", potSize: "8-inch pot", highlight: "Releases oxygen at night, the easiest to keep" },
          { name: "White peace lily", nameEn: "Peace Lily (Spathiphyllum)", potSize: "6-inch pot", highlight: "Filters fumes from paint and cleaning products" },
        ],
      },
      {
        styleName: "Easy Air Purifiers (Healthy Home Trio)",
        curatorNote: "A complete air-purifying trio that handles air-con and needs water only weekly",
        placementTips: "Spread them around the home: bedroom, living room and office",
        items: [
          { name: "Tall, dense snake plant", nameEn: 'Sansevieria Trifasciata 10"', potSize: "10-inch pot", highlight: "Tall and elegant, traps PM 2.5 dust" },
          { name: "Green ZZ plant", nameEn: "ZZ Plant", potSize: "8-inch pot", highlight: "Drought- and low-light-tolerant, glossy leaves remove toxins" },
          { name: "Variegated peace lily", nameEn: "Spathiphyllum Domino Variegated", potSize: "8-inch pot", highlight: "Absorbs formaldehyde and benzene" },
          { name: "Clay pebble top dressing", nameEn: "Expanded Clay Pebbles", potSize: "2-litre bag", highlight: "Holds moisture and stops soil splashing" },
        ],
      },
      {
        styleName: "Easy Air Purifiers (Pure Sanctuary Suite)",
        curatorNote: "Premium air purification combining hardy, high-value purifying plants",
        placementTips: "Perfect for city homes and condos that want the cleanest possible air",
        items: [
          { name: "Bushy fiddle-leaf fig", nameEn: "Ficus Lyrata Tree", potSize: "12-inch pot", highlight: "Large leaves trap airborne dust" },
          { name: "Variegated Raven ZZ", nameEn: "Zamioculcas Raven Variegated", potSize: "8-inch pot", highlight: "Jet-black leaves with green variegation, advanced purifier" },
          { name: "3-variety snake plant set", nameEn: "Sansevieria Triple Collector", potSize: "8-inch pot", highlight: "Golden Hahnii, Samurai and Moonshine together" },
          { name: "Biochar detox soil mix", nameEn: "Biochar Detox Soil Mix", potSize: "10-litre bag", highlight: "Biochar absorbs musty odours and heavy metals in soil" },
        ],
      },
    ],
  },
};
