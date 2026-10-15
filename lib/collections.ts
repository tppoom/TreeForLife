import type { SpeciesFilterParams } from "./services/speciesService";

export interface CollectionFaq {
  qTh: string;
  aTh: string;
  qEn: string;
  aEn: string;
}

export interface Collection {
  slug: string;
  titleTh: string;
  titleEn: string;
  badge: string;
  badgeEn: string;
  introTh: string;
  introEn: string;
  filter: SpeciesFilterParams;
  faqs: CollectionFaq[];
  icon: string;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "air-con-plants",
    titleTh: "ต้นไม้ห้องแอร์",
    titleEn: "Air-Conditioned Room Plants",
    badge: "สำหรับห้องแอร์",
    badgeEn: "Air-Con Ready",
    introTh:
      "รวมพันธุ์ไม้ที่ทนทานต่อสภาพอากาศแห้งและความเย็นของเครื่องปรับอากาศ พร้อมคุณสมบัติช่วยฟอกอากาศและเพิ่มความชุ่มชื้น คัดสรรสายพันธุ์ที่ไม่ทิ้งใบง่าย ดูแลง่ายในพื้นที่ปิด และเหมาะสำหรับห้องนอนหรือห้องทำงานเป็นพิเศษ",
    introEn:
      "A curated selection of resilient indoor plants that thrive in air-conditioned environments with cooler temperatures and drier air, purifying indoor spaces without shedding leaves.",
    filter: { placement: "indoor" },
    icon: "Wind",
    faqs: [
      {
        qTh: "เปิดแอร์ทั้งวันต้นไม้จะแห้งตายไหม?",
        aTh: "ไม่ตายครับ หากเป็นพันธุ์ไม้ในกลุ่มนี้ที่ใบหนาและกักเก็บน้ำได้ดี เพียงอย่าวางตรงตำแหน่งที่ลมแอร์เป่าปะทะใบโดยตรง และเช็คความชื้นดินก่อนรดน้ำ",
        qEn: "Will running air conditioning all day dry out my plants?",
        aEn: "No, these selected species feature thick foliage that retains moisture well. Just avoid positioning plants directly in front of the cold airflow vent.",
      },
      {
        qTh: "ควรรดน้ำต้นไม้ในห้องแอร์บ่อยแค่ไหน?",
        aTh: "ในห้องแอร์ความชื้นระเหยช้ากว่ากลางแจ้ง โดยเฉลี่ยแนะนำรดน้ำสัปดาห์ละ 1-2 ครั้ง หรือเมื่อใช้นิ้วจิ้มหน้าดินลึก 1-2 นิ้วแล้วรู้สึกแห้งสนิท",
        qEn: "How often should I water plants in an air-conditioned room?",
        aEn: "Soil moisture evaporates slower in air-conditioned spaces. Typically water once or twice a week when the top 1-2 inches of potting mix feel dry.",
      },
      {
        qTh: "ควรวางต้นไม้ห่างจากช่องลมแอร์แค่ไหน?",
        aTh: "ควรวางห่างจากแนวลมแอร์เป่าตรงอย่างน้อย 1.5 - 2 เมตร เพื่อป้องกันปลายใบไหม้แห้งจากลมเย็นกระแทก",
        qEn: "How far should plants be kept from AC vents?",
        aEn: "Position pots at least 1.5 to 2 meters away from direct AC blowers to prevent cold shock and dry leaf margins.",
      },
    ],
  },
  {
    slug: "pet-safe-plants",
    titleTh: "ต้นไม้ปลอดภัยกับสัตว์เลี้ยง",
    titleEn: "Pet-Safe Houseplants",
    badge: "ปลอดภัยต่อสุนัขและแมว",
    badgeEn: "Pet Friendly",
    introTh:
      "คัดสรรพันธุ์ไม้สวยงามที่ไม่เป็นพิษต่อสุนัขและแมว ปลอดภัยแม้สัตว์เลี้ยงเผลอแทะหรือสัมผัส ให้คุณเพลิดเพลินกับพื้นที่สีเขียวในบ้านได้อย่างสบายใจ ไร้กังวลเรื่องสารพิษอันตราย พร้อมคำแนะนำการจัดวางให้เป็นระเบียบ",
    introEn:
      "Certified non-toxic botanical specimens safe for curious dogs and cats, allowing pet lovers to cultivate a lush indoor jungle with total peace of mind.",
    filter: { petSafe: "safe" },
    icon: "ShieldCheck",
    faqs: [
      {
        qTh: "หากสัตว์เลี้ยงเผลอแทะใบจะเป็นอันตรายไหม?",
        aTh: "ต้นไม้ในกลุ่มนี้ผ่านการตรวจสอบตามเกณฑ์ความปลอดภัยของ ASPCA ไม่มีสารพิษแคลเซียมออกซาเลตที่เป็นอันตรายถึงชีวิต แต่อาจมีอาการระคายเคืองกระเพาะอาหารเล็กน้อยหากกลืนกินปริมาณมาก",
        qEn: "What happens if my dog or cat chews on these leaves?",
        aEn: "All species in this collection are certified non-toxic under ASPCA guidelines and free of dangerous toxins, though minor stomach upset can occur if eaten in excess.",
      },
      {
        qTh: "มีวิธีป้องกันไม่ให้แมวมาคุ้ยดินในกระถางไหม?",
        aTh: "แนะนำโรยหินภูเขาไฟก้อนกลางหรือก้อนกรวดปิดหน้าดิน และใช้สเปรย์กลิ่นซิตรัสธรรมชาติฉีดรอบกระถาง แมวมักไม่ชอบกลิ่นนี้",
        qEn: "How can I prevent cats from digging up the potting soil?",
        aEn: "Topdress pots with medium lava rocks or polished river pebbles, and mist citrus scent around outer pots as cats naturally dislike citrus aromas.",
      },
      {
        qTh: "ปุ๋ยและยาป้องกันแมลงที่ร้านใช้ปลอดภัยกับสัตว์เลี้ยงไหม?",
        aTh: "ทางร้านใช้วัสดุปลูกอินทรีย์และน้ำส้มควันไม้กำจัดแมลงโดยธรรมชาติ ปราศจากสารเคมีตกค้าง ปลอดภัยต่อสัตว์เลี้ยงในบ้าน 100%",
        qEn: "Are the nursery fertilizers and pest treatments safe for pets?",
        aEn: "We strictly apply organic fertilizers and natural wood vinegar pest barriers, ensuring 100% safe living conditions for your pets.",
      },
    ],
  },
  {
    slug: "beginner-plants",
    titleTh: "ต้นไม้มือใหม่เลี้ยงง่าย",
    titleEn: "Beginner-Friendly Plants",
    badge: "เลี้ยงง่าย ไม่จุกจิก",
    badgeEn: "Beginner Friendly",
    introTh:
      "ต้นไม้ที่อดทนสูง ปรับตัวเก่ง รดน้ำสัปดาห์ละ 1-2 ครั้งก็เติบโตได้ดี เหมาะสำหรับผู้เริ่มต้นปลูกต้นไม้ คนที่ไม่ค่อยมีเวลา หรือผู้ที่เคยปลูกแล้วกลัวตาย ปลูกรอดแน่นอน 100% พร้อมตารางดูแลแบบอัตโนมัติ",
    introEn:
      "Hardy, forgiving plants that withstand irregular care routines and fluctuating light conditions, ideal for aspiring plant owners looking for early gardening success.",
    filter: { difficulty: 1 },
    icon: "Sprout",
    faqs: [
      {
        qTh: "ถ้าลืมรดน้ำหลายวัน ต้นไม้จะตายไหม?",
        aTh: "ต้นไม้กลุ่มนี้ทนทานต่อการขาดน้ำได้ดี หากลืมรดน้ำ 5-7 วันยังสามารถฟื้นตัวได้ทันทีหลังได้รับน้ำใหม่อย่างเพียงพอ",
        qEn: "Will the plant die if I forget to water it for several days?",
        aEn: "These beginner species are exceptionally drought-tolerant and bounce back briskly even if you miss watering for up to a week.",
      },
      {
        qTh: "มือใหม่ควรเริ่มต้นด้วยดินและกระถางแบบไหน?",
        aTh: "ควรใช้กระถางที่มีรูก้นระบายน้ำดี และดินโปร่งระบายน้ำเร็วผสมกาบมะพร้าวสับกับเพอร์ไลท์ เพื่อป้องกันปัญหาน้ำขังรากเน่า",
        qEn: "What type of soil and pot should a beginner use?",
        aEn: "Always use containers with bottom drainage holes paired with chunky, well-draining soil mixes containing perlite and coconut husk chips.",
      },
      {
        qTh: "ต้องใส่ปุ๋ยบ่อยแค่ไหนสำหรับผู้เริ่มต้น?",
        aTh: "แนะนำใช้ปุ๋ยละลายช้า (ออสโมโค้ท) โรยรอบโคนต้นทุก 3 เดือน ง่ายและสะดวกที่สุด ไม่ต้องกังวลเรื่องปุ๋ยเกินจนรากไหม้",
        qEn: "How often should beginners apply plant food?",
        aEn: "Controlled-release fertilizer pellets applied every 3 months provide foolproof nutrition without any risk of root burn.",
      },
    ],
  },
  {
    slug: "full-sun-plants",
    titleTh: "ต้นไม้ทนแดดจัด",
    titleEn: "Full-Sun Outdoor Plants",
    badge: "ทนแดดเมืองไทย",
    badgeEn: "Full Sun Hardy",
    introTh:
      "รวบรวมพันธุ์ไม้ที่รักแสงแดดจัด แข็งแกร่งทนทานต่อสภาพอากาศร้อนและแสงแดดตลอดทั้งวันของเมืองไทย เหมาะสำหรับสวนกลางแจ้ง หน้าบ้าน ดาดฟ้า และพื้นที่รับแดดตรง ใบหนาสวยงามพร้อมรับลมร้อน",
    introEn:
      "Sun-loving tropical varieties built to withstand intense direct sunlight and tropical heat waves, perfect for open yards, front verandas, and sun-soaked rooftops.",
    filter: { light: "full_sun" },
    icon: "Sun",
    faqs: [
      {
        qTh: "ต้นไม้ทนแดดต้องรดน้ำทุกวันไหมเมื่ออยู่กลางแจ้ง?",
        aTh: "ในหน้าร้อนที่มีแดดจัดทั้งวัน ควรรดน้ำวันละ 1 ครั้งในช่วงเช้าตรู่ก่อน 8:00 น. หรือช่วงเย็นหลัง 17:00 น. หลีกเลี่ยงการรดน้ำตอนแดดจัดกลางวัน",
        qEn: "Do full-sun outdoor plants require daily watering in the summer?",
        aEn: "During intense hot seasons, water once daily in the early morning before 8 AM or after 5 PM, avoiding midday heat when water droplets can scald foliage.",
      },
      {
        qTh: "ถ้าย้ายจากร้านไปวางแดดจัดทันที ใบจะไหม้ไหม?",
        aTh: "ต้นไม้ของร้านผ่านการปรับสภาพมาแล้ว แต่หากเป็นจุดที่แดดร้อนจัดสะท้อนจากคอนกรีต แนะนำให้พักแดดรำไร 3-5 วันก่อนนำออกแดดเต็มวัน",
        qEn: "Will leaves burn if moved immediately into blistering sunlight?",
        aEn: "Our plants are hardened off, but we still recommend 3-5 days in partial sun before placing next to heat-retaining concrete patios.",
      },
      {
        qTh: "ควรใช้กระถางแบบไหนสำหรับตั้งกลางแดดจัด?",
        aTh: "แนะนำกระถางดินเผาหรือกระถางปูนที่มีความหนา เพราะช่วยป้องกันความร้อนถ่ายเทเข้าสู่ระบบรากได้ดีกว่ากระถางพลาสติกบาง",
        qEn: "What pots are best for plants under direct tropical sun?",
        aEn: "Thick terracotta or fiber-cement planters insulate root systems much better against midday solar radiation than thin plastic containers.",
      },
    ],
  },
  {
    slug: "bathroom-plants",
    titleTh: "ต้นไม้ในห้องน้ำ",
    titleEn: "Bathroom & Humidity-Loving Plants",
    badge: "ชอบความชื้นสูง",
    badgeEn: "High Humidity",
    introTh:
      "พันธุ์ไม้ที่ชื่นชอบความชื้นในอากาศสูง สามารถเติบโตได้ดีในห้องน้ำที่มีไอน้ำจากการอาบน้ำ ช่วยดูดซับกลิ่นอับ ฟอกอากาศ และเปลี่ยนห้องน้ำธรรมดาให้กลายเป็นโอเอซิสสไตล์สปาที่สดชื่นมีชีวิตชีวา",
    introEn:
      "Moisture-loving species that embrace warm bathroom humidity and steam, purifying air and bringing a serene, spa-like botanical aesthetic into your personal sanctuary.",
    filter: { placement: "bathroom" },
    icon: "Droplets",
    faqs: [
      {
        qTh: "ห้องน้ำที่ไม่มีหน้าต่างธรรมชาติ สามารถปลูกต้นไม้ได้ไหม?",
        aTh: "ปลูกได้ครับ หากเปิดไฟห้องน้ำเป็นประจำอย่างน้อย 6-8 ชม. หรือสลับนำต้นไม้ออกมารับแสงรำไรข้างนอกสัปดาห์ละ 1-2 วัน",
        qEn: "Can I grow plants in a bathroom without natural windows?",
        aEn: "Yes, provided the room light stays on for 6-8 hours daily, or by rotating the pot near an indirect light window once or twice a week.",
      },
      {
        qTh: "ละอองสบู่และแชมพูโดนใบจะเป็นอันตรายไหม?",
        aTh: "ละอองน้ำเล็กน้อยไม่เป็นอันตราย แต่ควรล้างน้ำสะอาดเช็ดใบเป็นครั้งคราว และอย่าวางใกล้ฝักบัวอาบน้ำจนถูกฟองสบู่ราดโดยตรง",
        qEn: "Will soap or shampoo splatters harm the plants?",
        aEn: "Occasional mist won't hurt, but gently wipe leaves with fresh water periodically and place pots outside the direct soap spray radius.",
      },
      {
        qTh: "ความชื้นสูงในห้องน้ำทำให้รากเน่าได้ง่ายขึ้นหรือไม่?",
        aTh: "รากเน่ามักเกิดจากน้ำขังในดิน ไม่ใช่ความชื้นในอากาศ ดังนั้นควรใช้ดินที่ระบายน้ำดีเป็นพิเศษ และรดน้ำเฉพาะเมื่อดินชั้นบนแห้ง",
        qEn: "Does bathroom humidity cause root rot?",
        aEn: "Root rot results from waterlogged soil rather than ambient air humidity. Ensure superior drainage holes and inspect topsoil dryness prior to watering.",
      },
    ],
  },
  {
    slug: "low-light-plants",
    titleTh: "ต้นไม้แสงน้อย",
    titleEn: "Low-Light Tolerant Plants",
    badge: "แสงน้อยก็โตได้",
    badgeEn: "Low Light Tolerant",
    introTh:
      "คัดสรรต้นไม้ฟอร์มสวยที่สามารถมีชีวิตชีวาได้แม้ในมุมอับแสง ห่างหน้าต่าง หรือในห้องที่เปิดไฟนีออนเป็นหลัก เหมาะสำหรับคอนโด ออฟฟิศ และห้องนอนที่ไม่ค่อยมีแสงธรรมชาติ ใบยังคงเขียวสดชื่นเสมอ",
    introEn:
      "Resilient shade-tolerant specimens that thrive in interior corridors, windowless office rooms, and low-light living areas under standard fluorescent illumination.",
    filter: { light: "low_light" },
    icon: "Moon",
    faqs: [
      {
        qTh: "แสงน้อยแค่ไหนที่ต้นไม้ในกลุ่มนี้ยังเติบโตได้?",
        aTh: "สามารถอยู่ได้ในจุดที่แสงสว่างเพียงพอสำหรับการอ่านหนังสือ หรือจุดที่ห่างจากหน้าต่าง 3-5 เมตร โดยยังคงสภาพใบที่สวยงามสมบูรณ์",
        qEn: "How dim can the lighting be for these plants to survive?",
        aEn: "They thrive wherever light is comfortable enough to read a book, including spots 3 to 5 meters away from natural exterior windows.",
      },
      {
        qTh: "ในที่แสงน้อย ควรรดน้ำบ่อยแค่ไหน?",
        aTh: "เนื่องจากการสังเคราะห์แสงและการคายน้ำเกิดขึ้นช้าลง ควรรดน้ำให้น้อยลง เช่น ทุกๆ 10-14 วัน หรือเมื่อดินแห้งสนิทเกือบถึงก้นกระถาง",
        qEn: "How frequently should I water plants kept in low light?",
        aEn: "Because evaporation and transpiration are much slower, extend watering intervals to every 10-14 days once the pot dries thoroughly.",
      },
      {
        qTh: "สามารถใช้ไฟ LED หรือไฟโต๊ะทำงานช่วยเสริมได้ไหม?",
        aTh: "ใช้ได้ผลดีมากครับ ไฟ LED แสงขาวธรรมดาระยะห่าง 30-50 ซม. สามารถช่วยให้ต้นไม้สังเคราะห์แสงได้ดีขึ้นอย่างเห็นได้ชัด",
        qEn: "Can standard desktop LED lamps support plant growth?",
        aEn: "Yes, everyday white LED task lamps mounted 30-50 cm away provide beneficial supplemental photosynthetic light.",
      },
    ],
  },
  {
    slug: "desk-plants",
    titleTh: "ต้นเล็กวางโต๊ะทำงาน",
    titleEn: "Desktop & Compact Plants",
    badge: "ขนาดกะทัดรัด",
    badgeEn: "Compact Desktop",
    introTh:
      "ต้นไม้ขนาดเล็กกะทัดรัด ฟอร์มกระถางสวยงาม จัดวางบนโต๊ะทำงานหรือชั้นวางหนังสือได้พอดี ช่วยพักสายตาจากหน้าจอคอมพิวเตอร์ เพิ่มความสดชื่นและความคิดสร้างสรรค์ตลอดวันทำงานโดยไม่เกะกะพื้นที่",
    introEn:
      "Petite desktop plants designed to fit neatly on workstations, bookshelves, and side tables, enhancing productivity and providing natural green relief during long work days.",
    filter: { matureSize: "sm" },
    icon: "Laptop",
    faqs: [
      {
        qTh: "ต้นไม้บนโต๊ะทำงานโตเร็วเกินไปจนล้นโต๊ะไหม?",
        aTh: "สายพันธุ์ในคอลเลกชันนี้คัดเฉพาะพันธุ์โตช้าและขนาดกะทัดรัด เมื่อเลี้ยงในกระถางเล็กจะคงขนาดทรงพุ่มสวยงามได้นานหลายปี",
        qEn: "Will desktop plants quickly outgrow a compact workspace?",
        aEn: "These varieties are naturally slow-growing miniatures whose root systems remain tidy in small designer pots for multiple years.",
      },
      {
        qTh: "รดน้ำบนโต๊ะทำงานอย่างไรไม่ให้เลอะเอกสารและอุปกรณ์?",
        aTh: "แนะนำยกกระถางไปรดน้ำที่อ่างล้างมือ ปล่อยให้น้ำไหลออกก้นกระถางจนหมด 5 นาที แล้วจึงนำกลับมาวางบนจานรองที่โต๊ะ",
        qEn: "How do I water desk plants cleanly without risking paperwork?",
        aEn: "Bring the planter to a pantry or sink, water thoroughly until it drains out, wait 5 minutes, then place it back onto a protective saucer.",
      },
      {
        qTh: "ต้นไม้วางใกล้คอมพิวเตอร์และจอมีประโยชน์อย่างไร?",
        aTh: "ช่วยดูดซับรังสีความร้อน พักสายตาสีเขียวลดความเมื่อยล้า และช่วยเพิ่มความผ่อนคลายลดความเครียดในการทำงานอย่างมีนัยสำคัญ",
        qEn: "What are the benefits of having plants next to computer screens?",
        aEn: "Natural green views give frequent visual micro-breaks that relieve eye strain and demonstrably reduce desk stress levels.",
      },
    ],
  },
  {
    slug: "balcony-plants",
    titleTh: "ต้นไม้ระเบียงคอนโด",
    titleEn: "Condo Balcony Plants",
    badge: "ระเบียงคอนโด",
    badgeEn: "Balcony Hardy",
    introTh:
      "พันธุ์ไม้ที่เหมาะสำหรับจัดวางบริเวณระเบียงห้องพักและคอนโด ทนทานต่อลมพัดและอุณหภูมิภายนอก เพิ่มความเป็นส่วนตัวและสร้างบรรยากาศสวนระเบียงส่วนตัวในเมืองหลวง ให้คุณมีมุมผ่อนคลายรับลมธรรมชาติ",
    introEn:
      "Balcony-tailored plants designed to withstand variable urban wind currents and temperature swings, transforming apartment terraces into private sky-high greenery.",
    filter: { placement: "balcony" },
    icon: "Building2",
    faqs: [
      {
        qTh: "ระเบียงคอนโดชั้นสูงลมแรง ต้นไม้จะทนไหวไหม?",
        aTh: "พันธุ์ไม้ในกลุ่มนี้มีก้านใบเหนียวและรากยึดเกาะแน่นหนา ทนทานต่อแรงลมกรรโชกบนตึกสูงได้ดีเป็นพิเศษ",
        qEn: "Can these plants withstand strong wind gusts on high-rise balconies?",
        aEn: "Selected varieties possess sturdy stem structures and resilient foliage adapted to withstand gusty winds atop high-rise residential towers.",
      },
      {
        qTh: "การรดน้ำที่ระเบียงต้องระวังไม่ให้น้ำหยดลงชั้นล่างอย่างไร?",
        aTh: "ควรใช้จานรองกระถางที่มีความลึกพอสมควร และเทน้ำส่วนเกินออกจากจานรองหลังรดน้ำเสร็จ 15 นาที เพื่อป้องกันน้ำล้นและยุงลาย",
        qEn: "How do I manage runoff water to avoid dripping onto lower floors?",
        aEn: "Utilize deep catchment saucers beneath pots, and empty excess drainage water 15 minutes post-watering to avoid overflow issues.",
      },
      {
        qTh: "ถ้าระเบียงโดนแดดแค่ช่วงเช้าหรือบ่าย จะเติบโตได้ดีไหม?",
        aTh: "ได้ดีมากครับ พันธุ์ไม้ระเบียงคอนโดปรับตัวกับแดดรำไรถึงแดดครึ่งวันได้สมบูรณ์แบบ เพียงหมุนกระถางเดือนละครั้งเพื่อให้ใบรับแสงรอบทิศ",
        qEn: "Will balcony plants flourish with only half-day morning or afternoon sun?",
        aEn: "Yes, they adapt splendidly to half-day sunlight. Simply rotate the pots monthly so foliage develops uniformly from all angles.",
      },
    ],
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
