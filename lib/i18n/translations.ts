export type Locale = "th" | "en";

export interface TranslationDictionary {
  nav: {
    home: string;
    catalog: string;
    garden: string;
    today: string;
    favorites: string;
    admin: string;
    search: string;
    role: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    menu: string;
    close: string;
    open_menu: string;
    close_menu: string;
    ask_shop_line: string;
  };
  roles: {
    guest: string;
    customer: string;
    staff: string;
    admin: string;
    switch_role: string;
    current_role: string;
    guest_desc: string;
    customer_desc: string;
    staff_desc: string;
    admin_desc: string;
  };
  search: {
    placeholder: string;
    search_button: string;
    quick_filters: string;
    shortcut_indoor: string;
    shortcut_sun: string;
    shortcut_pet: string;
    shortcut_beginner: string;
    shortcut_air: string;
    shortcut_desk: string;
    filters: string;
    clear_filters: string;
    results_count: string;
    no_results_title: string;
    no_results_desc: string;
    ask_shop_line: string;
    sort_by: string;
    sort_relevance: string;
    sort_in_stock: string;
    sort_easiest: string;
    view_all: string;
  };
  filters: {
    light: string;
    water: string;
    placement: string;
    difficulty: string;
    pet: string;
    size: string;
    status: string;
    light_full_sun: string;
    light_partial: string;
    light_shade: string;
    light_indoor_bright: string;
    light_low_light: string;
    water_low: string;
    water_medium: string;
    water_high: string;
    placement_outdoor_sun: string;
    placement_balcony_shade: string;
    placement_indoor_window: string;
    placement_indoor_far: string;
    placement_air_con: string;
    placement_indoor: string;
    placement_outdoor: string;
    placement_balcony: string;
    placement_bathroom: string;
    pot_terracotta: string;
    pot_plastic: string;
    pot_ceramic_glazed: string;
    pot_cement: string;
    pot_hanging: string;
    size_xs: string;
    size_sm: string;
    size_md: string;
    size_lg: string;
    size_xl: string;
    difficulty_1: string;
    difficulty_2: string;
    difficulty_3: string;
    difficulty_4: string;
    difficulty_5: string;
    pet_safe: string;
    pet_toxic: string;
    pet_unknown: string;
    stock_in_stock: string;
    stock_made_to_order: string;
    stock_seasonal: string;
    stock_hidden: string;
    acquired_shop: string;
    acquired_elsewhere: string;
    acquired_gift: string;
    acquired_propagated: string;
  };
  care: {
    water: string;
    fertilize: string;
    repot: string;
    prune: string;
    pest_check: string;
    days_unit: string;
    every_days: string;
    every_months: string;
    season_hot: string;
    season_rainy: string;
    season_cool: string;
    schedule_explanation: string;
    pot_size: string;
    inches: string;
    overdue_days: string;
    due_today: string;
    due_in_days: string;
    action_water_done: string;
    action_mark_done: string;
    action_snooze: string;
    action_skip: string;
    shop_owner_tip: string;
    common_problems: string;
    similar_plants: string;
    care_guide: string;
    soil_mix: string;
    fertilizer_note: string;
    propagation: string;
  };
  garden: {
    title: string;
    subtitle: string;
    add_plant: string;
    my_plants_count: string;
    empty_title: string;
    empty_desc: string;
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
    custom_species: string;
    custom_species_prompt: string;
    nickname_label: string;
    nickname_placeholder: string;
    acquired_date: string;
    acquired_source: string;
    pot_size_label: string;
    pot_material_label: string;
    placement_label: string;
    preview_schedule: string;
    submit_add: string;
    archive_plant: string;
    history_timeline: string;
    calendar_30_days: string;
    plant_details: string;
    edit_plant: string;
    save_changes: string;
    notes_label: string;
    notes_placeholder: string;
  };
  today: {
    title: string;
    subtitle: string;
    overdue_section: string;
    today_section: string;
    upcoming_section: string;
    mark_all_done: string;
    all_done_title: string;
    all_done_desc: string;
    no_tasks: string;
    snooze_day: string;
    skip_cycle: string;
  };
  inquiry: {
    ask_shop: string;
    intent_price: string;
    intent_availability: string;
    intent_care_help: string;
    intent_design_quote: string;
    chat_line_title: string;
    ref_code_label: string;
    copy_message: string;
    message_copied: string;
    open_line_app: string;
    inquiry_sent: string;
    desktop_line_prompt: string;
  };
  admin: {
    portal_title: string;
    species_mgmt: string;
    care_templates: string;
    problems: string;
    inquiries: string;
    search_misses: string;
    add_species: string;
    edit_species: string;
    save: string;
    cancel: string;
    delete: string;
    stock_status: string;
    inline_edit_saved: string;
    unauthorized: string;
    switch_to_admin: string;
    total_species: string;
    query_count: string;
    last_seen: string;
    tab_inventory: string;
    tab_inquiries: string;
    tab_search_misses: string;
    search_placeholder: string;
    filter_stock_all: string;
    stock_in_stock: string;
    stock_made_to_order: string;
    stock_seasonal: string;
    stock_hidden: string;
    last_updated: string;
    ref_code: string;
    customer_intent: string;
    source_page: string;
    payload_details: string;
    missed_query: string;
    demand_count: string;
    stats_in_stock: string;
    stats_made_to_order: string;
    stats_seasonal: string;
    stats_inquiries: string;
    stats_misses: string;
    role_upgrade_desc: string;
    switch_to_staff: string;
    switch_to_admin_btn: string;
    role_current: string;
    action_update_success: string;
    action_update_error: string;
    empty_inventory: string;
    empty_inquiries: string;
    empty_search_misses: string;
  };
  toasts: {
    plant_added: string;
    task_done: string;
    task_snoozed: string;
    task_skipped: string;
    all_tasks_done: string;
    copied: string;
    role_switched: string;
    locale_switched: string;
    theme_switched: string;
    guest_merged: string;
    error_generic: string;
  };
  footer: {
    about_title: string;
    about_desc: string;
    hours_label: string;
    hours_val: string;
    location_label: string;
    location_val: string;
    line_cta_title: string;
    line_cta_button: string;
    line_id: string;
    quick_links: string;
    copyright: string;
    nurtured_note: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  th: {
    nav: {
      home: "หน้าแรก",
      catalog: "พันธุ์ไม้",
      garden: "สวนของฉัน",
      today: "งานวันนี้",
      favorites: "รายการโปรด",
      admin: "จัดการร้าน",
      search: "ค้นหา",
      role: "บทบาท",
      language: "ภาษา",
      theme: "โหมดสี",
      light: "สว่าง",
      dark: "มืด",
      menu: "เมนู",
      close: "ปิด",
      open_menu: "เปิดเมนู",
      close_menu: "ปิดเมนู",
      ask_shop_line: "ทักถามร้าน",
    },
    roles: {
      guest: "ผู้เยี่ยมชม (Guest)",
      customer: "ลูกค้า (Customer)",
      staff: "พนักงานร้าน (Staff)",
      admin: "ผู้ดูแลระบบ (Admin)",
      switch_role: "สลับบทบาทเดโม",
      current_role: "บทบาทปัจจุบัน",
      guest_desc: "ผู้ใช้งานทั่วไป ไม่ต้องเข้าสู่ระบบ บันทึกข้อมูลในเครื่อง",
      customer_desc: "สมาชิกลูกค้า จัดการสวนและซิงค์ข้อมูลข้ามอุปกรณ์",
      staff_desc: "พนักงานร้าน ตรวจสอบและอัปเดตสต็อกต้นไม้",
      admin_desc: "ผู้ดูแลระบบเต็มรูปแบบ จัดการพันธุ์ไม้ สูตรดูแล และคำค้นหา",
    },
    search: {
      placeholder: "ค้นหาชื่อไทย อังกฤษ หรือชื่อเล่น เช่น มอนสเตอร่า...",
      search_button: "ค้นหา",
      quick_filters: "ทางลัดยอดนิยม",
      shortcut_indoor: "ในบ้าน",
      shortcut_sun: "ทนแดด",
      shortcut_pet: "ปลอดภัยกับสัตว์เลี้ยง",
      shortcut_beginner: "เลี้ยงง่ายมือใหม่",
      shortcut_air: "ฟอกอากาศ",
      shortcut_desk: "ต้นเล็กวางโต๊ะ",
      filters: "ตัวกรอง",
      clear_filters: "ล้างตัวกรอง",
      results_count: "พบ {count} พันธุ์ไม้",
      no_results_title: "ยังไม่มีข้อมูลต้นไม้นี้",
      no_results_desc: "ทักถามที่ร้านโดยตรงทาง LINE ได้เลย เราอาจมีต้นที่คุณกำลังตามหาอยู่!",
      ask_shop_line: "ทักถามร้านทาง LINE",
      sort_by: "เรียงตาม",
      sort_relevance: "ตรงที่สุด",
      sort_in_stock: "มีที่ร้านก่อน",
      sort_easiest: "เลี้ยงง่ายที่สุด",
      view_all: "ดูทั้งหมด",
    },
    filters: {
      light: "ความต้องการแสง",
      water: "ความต้องการน้ำ",
      placement: "ตำแหน่งที่เหมาะสม",
      difficulty: "ระดับความยาก",
      pet: "ความปลอดภัยกับสัตว์เลี้ยง",
      size: "ขนาดเมื่อโตเต็มที่",
      status: "สถานะสินค้า",
      light_full_sun: "แดดจัด (6+ ชม.)",
      light_partial: "แดดรำไร",
      light_shade: "ร่มรำไร",
      light_indoor_bright: "ในบ้านสว่าง",
      light_low_light: "แสงน้อย",
      water_low: "น้ำน้อย (7+ วัน)",
      water_medium: "น้ำปานกลาง (3–7 วัน)",
      water_high: "น้ำมาก (1–3 วัน)",
      placement_outdoor_sun: "กลางแจ้งแดดจัด",
      placement_balcony_shade: "ระเบียงร่มรำไร",
      placement_indoor_window: "ริมหน้าต่างในบ้าน",
      placement_indoor_far: "กลางห้องในบ้าน",
      placement_air_con: "ห้องแอร์",
      placement_indoor: "ในบ้าน",
      placement_outdoor: "นอกบ้าน",
      placement_balcony: "ระเบียง",
      placement_bathroom: "ห้องน้ำ",
      pot_terracotta: "ดินเผา",
      pot_plastic: "พลาสติก",
      pot_ceramic_glazed: "เซรามิกเคลือบ",
      pot_cement: "ปูนเปลือย / ซีเมนต์",
      pot_hanging: "กระเช้าแขวน / มะพร้าว",
      size_xs: "เล็กมาก (<15 ซม.)",
      size_sm: "เล็ก (15–30 ซม.)",
      size_md: "กลาง (30–100 ซม.)",
      size_lg: "ใหญ่ (100–200 ซม.)",
      size_xl: "สูงมาก (>200 ซม.)",
      difficulty_1: "ง่ายมาก (1/5)",
      difficulty_2: "ค่อนข้างง่าย (2/5)",
      difficulty_3: "ปานกลาง (3/5)",
      difficulty_4: "ต้องดูแลเป็นพิเศษ (4/5)",
      difficulty_5: "ผู้เชี่ยวชาญ (5/5)",
      pet_safe: "ปลอดภัยกับสัตว์เลี้ยง",
      pet_toxic: "เป็นพิษต่อสัตว์เลี้ยง",
      pet_unknown: "ไม่ระบุ / ควรระวัง",
      stock_in_stock: "มีที่ร้านพร้อมส่ง",
      stock_made_to_order: "สั่งได้ (~7-14 วัน)",
      stock_seasonal: "ตามฤดูกาล",
      stock_hidden: "ซ่อน",
      acquired_shop: "ซื้อจากร้าน TreeForLife",
      acquired_elsewhere: "ซื้อจากที่อื่น",
      acquired_gift: "ได้เป็นของขวัญ",
      acquired_propagated: "ขยายพันธุ์เอง",
    },
    care: {
      water: "รดน้ำ",
      fertilize: "ใส่ปุ๋ย",
      repot: "เปลี่ยนกระถาง",
      prune: "ตัดแต่งกิ่ง",
      pest_check: "ตรวจโรคและแมลง",
      days_unit: "{days} วัน",
      every_days: "ทุกๆ {days} วัน",
      every_months: "ทุกๆ {months} เดือน",
      season_hot: "หน้าร้อน (มี.ค. - พ.ค.)",
      season_rainy: "หน้าฝน (มิ.ย. - ต.ค.)",
      season_cool: "หน้าหนาว (พ.ย. - ก.พ.)",
      schedule_explanation: "คำนวณตามสภาพอากาศไทย วัสดุกระถาง และตำแหน่งที่วาง",
      pot_size: "ขนาดกระถาง",
      inches: "{inches} นิ้ว",
      overdue_days: "เลยกำหนด {count} วัน",
      due_today: "ครบกำหนดวันนี้",
      due_in_days: "อีก {count} วัน",
      action_water_done: "รดน้ำแล้ว",
      action_mark_done: "บันทึกเรียบร้อย",
      action_snooze: "เลื่อนไป 1 วัน",
      action_skip: "ข้ามรอบนี้",
      shop_owner_tip: "คำแนะนำจากที่ร้าน",
      common_problems: "ปัญหาที่พบบ่อยและวิธีแก้",
      similar_plants: "พันธุ์ที่ใกล้เคียงกัน",
      care_guide: "คู่มือการดูแล",
      soil_mix: "สูตรผสมดิน",
      fertilizer_note: "คำแนะนำการให้ปุ๋ย",
      propagation: "การขยายพันธุ์",
    },
    garden: {
      title: "สวนของฉัน",
      subtitle: "จัดการต้นไม้และตารางดูแลอัตโนมัติที่ออกแบบมาเพื่อคุณ",
      add_plant: "เพิ่มต้นไม้เข้าสวน",
      my_plants_count: "ต้นไม้ทั้งหมด {count} ต้น",
      empty_title: "ยังไม่มีต้นไม้ในสวนของคุณ",
      empty_desc: "เริ่มเพิ่มต้นไม้ต้นแรกเพื่อให้ระบบช่วยจำตารางรดน้ำและแจ้งเตือนอย่างแม่นยำ",
      step_1: "เลือกพันธุ์ไม้",
      step_2: "ตั้งชื่อเล่นและที่มา",
      step_3: "เลือกกระถางและขนาด",
      step_4: "เลือกตำแหน่งที่วาง",
      custom_species: "พันธุ์อื่นๆ / ระบุเอง",
      custom_species_prompt: "ระบุชื่อพันธุ์ต้นไม้ของคุณ",
      nickname_label: "ชื่อเล่นของต้นไม้",
      nickname_placeholder: "เช่น น้องมอน, มารวย",
      acquired_date: "วันที่รับมาเลี้ยง",
      acquired_source: "ที่มาของต้นไม้",
      pot_size_label: "ขนาดกระถาง (เส้นผ่านศูนย์กลางเป็นนิ้ว)",
      pot_material_label: "วัสดุของกระถาง",
      placement_label: "ตำแหน่งที่ตั้งวาง",
      preview_schedule: "ตารางดูแลที่คำนวณได้สำหรับต้นนี้",
      submit_add: "บันทึกเข้าสู่สวนของฉัน",
      archive_plant: "เก็บเข้าคลังประวัติ (ต้นตาย/ส่งต่อ)",
      history_timeline: "ประวัติการดูแลย้อนหลัง",
      calendar_30_days: "ปฏิทินดูแล 30 วันข้างหน้า",
      plant_details: "รายละเอียดต้นไม้",
      edit_plant: "แก้ไขข้อมูลต้นไม้",
      save_changes: "บันทึกการเปลี่ยนแปลง",
      notes_label: "บันทึกช่วยจำ",
      notes_placeholder: "จดบันทึกเกี่ยวกับต้นไม้นี้ เช่น อาการ หรือการเปลี่ยนกระถาง...",
    },
    today: {
      title: "งานดูแลวันนี้",
      subtitle: "รายการดูแลต้นไม้ที่ครบกำหนดประจำวัน",
      overdue_section: "งานที่เลยกำหนด",
      today_section: "งานที่ต้องทำวันนี้",
      upcoming_section: "งานเร็วๆ นี้",
      mark_all_done: "รดน้ำทุกต้นครบแล้ว",
      all_done_title: "ยอดเยี่ยม! งานดูแลเสร็จสิ้นทั้งหมดแล้ว",
      all_done_desc: "ไม่มีงานที่ต้องทำวันนี้ ต้นไม้ทุกต้นได้รับการดูแลเรียบร้อยแล้ว 🌿",
      no_tasks: "ไม่มีงานที่ต้องทำวันนี้ ต้นไม้ทุกต้นได้รับการดูแลเรียบร้อยแล้ว 🌿",
      snooze_day: "เลื่อน 1 วัน",
      skip_cycle: "ข้ามรอบนี้",
    },
    inquiry: {
      ask_shop: "ถามร้านเรื่องต้นนี้",
      intent_price: "สอบถามราคาและขนาดที่มี",
      intent_availability: "สอบถามว่ามีของหรือไม่",
      intent_care_help: "ปรึกษาอาการและวิธีดูแล",
      intent_design_quote: "ขอใบเสนอราคาจัดมุมต้นไม้",
      chat_line_title: "ทักแชทกับที่ร้านผ่าน LINE",
      ref_code_label: "รหัสอ้างอิง",
      copy_message: "คัดลอกข้อความ",
      message_copied: "คัดลอกข้อความแล้ว ส่งในแชท LINE ได้ทันที",
      open_line_app: "เปิดแอป LINE เลย",
      inquiry_sent: "สร้างรหัสสอบถามเรียบร้อยแล้ว",
      desktop_line_prompt: "สแกน QR Code หรือเพิ่มเพื่อน @treeforlife ใน LINE พร้อมส่งข้อความด้านล่างนี้:",
    },
    admin: {
      portal_title: "ระบบจัดการร้าน",
      species_mgmt: "จัดการพันธุ์ไม้",
      care_templates: "สูตรการดูแล",
      problems: "ปัญหาที่พบบ่อย",
      inquiries: "รายการสอบถามจากลูกค้า",
      search_misses: "คำค้นหาที่ไม่พบผลลัพธ์",
      add_species: "เพิ่มพันธุ์ไม้ใหม่",
      edit_species: "แก้ไขพันธุ์ไม้",
      save: "บันทึกข้อมูล",
      cancel: "ยกเลิก",
      delete: "ลบ",
      stock_status: "สถานะสต็อก",
      inline_edit_saved: "บันทึกสถานะเรียบร้อยแล้ว",
      unauthorized: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะพนักงานหรือผู้ดูแลระบบ)",
      switch_to_admin: "สลับเป็นบทบาท Admin หรือ Staff เพื่อทดสอบ",
      total_species: "พันธุ์ไม้ทั้งหมด {count} ชนิด",
      query_count: "จำนวนการค้นหา",
      last_seen: "ค้นหาล่าสุดเมื่อ",
      tab_inventory: "คลังพันธุ์ไม้และสต็อก",
      tab_inquiries: "บันทึกสอบถามจากลูกค้า",
      tab_search_misses: "คำค้นหาที่ไม่พบผลลัพธ์",
      search_placeholder: "ค้นหาชื่อพันธุ์ไม้ (ไทย/อังกฤษ/วิทยาศาสตร์)...",
      filter_stock_all: "ทุกสถานะสต็อก",
      stock_in_stock: "มีสินค้าพร้อมส่ง",
      stock_made_to_order: "สั่งเพาะ / สั่งทำ",
      stock_seasonal: "ตามฤดูกาล",
      stock_hidden: "ซ่อนจากหน้าร้าน",
      last_updated: "อัปเดตล่าสุด",
      ref_code: "รหัสอ้างอิง",
      customer_intent: "จุดประสงค์การติดต่อ",
      source_page: "จากหน้า",
      payload_details: "ข้อมูลการสอบถาม",
      missed_query: "คำค้นหาที่ไม่พบ",
      demand_count: "จำนวนค้นหา",
      stats_in_stock: "พร้อมส่ง",
      stats_made_to_order: "สั่งทำ",
      stats_seasonal: "ตามฤดูกาล",
      stats_inquiries: "รายการสอบถาม",
      stats_misses: "ความต้องการที่ค้นหาไม่พบ",
      role_upgrade_desc: "หน้านี้มีข้อมูลสต็อกสินค้า รายการลูกค้า และสถิติเชิงลึกของร้าน กรุณาสลับเป็นบทบาท Staff หรือ Admin เพื่อเข้าใช้งาน",
      switch_to_staff: "สลับเป็น พนักงานร้าน (Staff)",
      switch_to_admin_btn: "สลับเป็น เจ้าของร้าน (Admin)",
      role_current: "บทบาทปัจจุบันของคุณคือ",
      action_update_success: "ปรับปรุงสถานะสต็อกเรียบร้อยแล้ว",
      action_update_error: "เกิดข้อผิดพลาดในการปรับสถานะ กรุณาลองใหม่อีกครั้ง",
      empty_inventory: "ไม่พบพันธุ์ไม้ที่ตรงกับคำค้นหา",
      empty_inquiries: "ยังไม่มีประวัติการสอบถามจากลูกค้า",
      empty_search_misses: "ยังไม่มีประวัติคำค้นหาที่ไม่พบผลลัพธ์",
    },
    toasts: {
      plant_added: "เพิ่มต้นไม้เข้าสู่สวนของคุณเรียบร้อยแล้ว 🌿",
      task_done: "บันทึกงานดูแลเรียบร้อยแล้ว!",
      task_snoozed: "เลื่อนงานไปอีก 1 วันแล้ว",
      task_skipped: "ข้ามรอบการดูแลนี้แล้ว",
      all_tasks_done: "บันทึกสำเร็จครบทุกงานแล้วในคลิกเดียว!",
      copied: "คัดลอกลงคลิปบอร์ดแล้ว",
      role_switched: "เปลี่ยนบทบาทเดโมเป็น {role} แล้ว",
      locale_switched: "เปลี่ยนภาษาเป็น {lang} แล้ว",
      theme_switched: "เปลี่ยนโหมดสีเป็น {theme} แล้ว",
      guest_merged: "โอนย้ายต้นไม้ที่บันทึกไว้เข้าสู่บัญชีของคุณเรียบร้อยแล้ว",
      error_generic: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    },
    footer: {
      about_title: "ร้าน TreeForLife",
      about_desc: "ร้านต้นไม้คัดพิเศษใจกลางกรุงเทพฯ ทุกต้นผ่านการเพาะเลี้ยงและทดสอบการเติบโตในสภาพอากาศจริงของไทย พร้อมตารางการดูแลที่ปรับตาม 3 ฤดูกาลอย่างแม่นยำ",
      hours_label: "เวลาทำการ",
      hours_val: "เปิดทุกวัน 09:00 - 18:00 น.",
      location_label: "ที่ตั้งร้าน",
      location_val: "กรุงเทพมหานคร ประเทศไทย",
      line_cta_title: "ต้องการคำปรึกษาเรื่องต้นไม้?",
      line_cta_button: "ทักคุยกับร้านทาง LINE",
      line_id: "LINE OA: @treeforlife",
      quick_links: "เมนูลัด",
      copyright: "© {year} TreeForLife. สงวนลิขสิทธิ์ทั้งหมด",
      nurtured_note: "ดูแลด้วยใจ ปลูกด้วยรัก · Nurtured with care",
    },
  },
  en: {
    nav: {
      home: "Home",
      catalog: "Catalog",
      garden: "My Garden",
      today: "Today's Tasks",
      favorites: "Favorites",
      admin: "Admin Portal",
      search: "Search",
      role: "Role",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      menu: "Menu",
      close: "Close",
      open_menu: "Open menu",
      close_menu: "Close menu",
      ask_shop_line: "Ask Shop",
    },
    roles: {
      guest: "Guest",
      customer: "Customer",
      staff: "Shop Staff",
      admin: "Administrator",
      switch_role: "Switch Demo Role",
      current_role: "Current Role",
      guest_desc: "Anonymous user, data stored locally in your browser",
      customer_desc: "Registered member, syncs plants & garden across devices",
      staff_desc: "Shop staff, inspect and update live plant stock",
      admin_desc: "Full administrator, manage species, care formulas, and analytics",
    },
    search: {
      placeholder: "Search Thai, English, or nicknames e.g. Monstera...",
      search_button: "Search",
      quick_filters: "Popular Shortcuts",
      shortcut_indoor: "Indoor",
      shortcut_sun: "Sun Loving",
      shortcut_pet: "Pet Friendly",
      shortcut_beginner: "Beginner",
      shortcut_air: "Air Purifying",
      shortcut_desk: "Desk Plants",
      filters: "Filters",
      clear_filters: "Clear Filters",
      results_count: "Found {count} plants",
      no_results_title: "No plants found",
      no_results_desc: "Ask our nursery directly on LINE! We might have it in our greenhouse.",
      ask_shop_line: "Ask Shop on LINE",
      sort_by: "Sort By",
      sort_relevance: "Most Relevant",
      sort_in_stock: "In Stock First",
      sort_easiest: "Easiest Care",
      view_all: "View All",
    },
    filters: {
      light: "Light Needs",
      water: "Water Needs",
      placement: "Suitable Placement",
      difficulty: "Difficulty",
      pet: "Pet Safety",
      size: "Mature Size",
      status: "Availability",
      light_full_sun: "Full Sun (6+ hrs)",
      light_partial: "Partial Sun",
      light_shade: "Shade",
      light_indoor_bright: "Bright Indoor",
      light_low_light: "Low Light",
      water_low: "Low (7+ days)",
      water_medium: "Medium (3–7 days)",
      water_high: "High (1–3 days)",
      placement_outdoor_sun: "Outdoor Full Sun",
      placement_balcony_shade: "Balcony Shade",
      placement_indoor_window: "Indoor Window",
      placement_indoor_far: "Indoor Center",
      placement_air_con: "Air-Conditioned Room",
      placement_indoor: "Indoor",
      placement_outdoor: "Outdoor",
      placement_balcony: "Balcony",
      placement_bathroom: "Bathroom",
      pot_terracotta: "Terracotta",
      pot_plastic: "Plastic",
      pot_ceramic_glazed: "Glazed Ceramic",
      pot_cement: "Cement / Concrete",
      pot_hanging: "Hanging Basket / Coir",
      size_xs: "Extra Small (<15 cm)",
      size_sm: "Small (15–30 cm)",
      size_md: "Medium (30–100 cm)",
      size_lg: "Large (100–200 cm)",
      size_xl: "Extra Large (>200 cm)",
      difficulty_1: "Very Easy (1/5)",
      difficulty_2: "Easy (2/5)",
      difficulty_3: "Moderate (3/5)",
      difficulty_4: "Challenging (4/5)",
      difficulty_5: "Expert Only (5/5)",
      pet_safe: "Pet Safe",
      pet_toxic: "Toxic to Pets",
      pet_unknown: "Unknown / Use Caution",
      stock_in_stock: "In Stock Ready",
      stock_made_to_order: "Made to Order (~7-14 days)",
      stock_seasonal: "Seasonal",
      stock_hidden: "Hidden",
      acquired_shop: "Bought from TreeForLife",
      acquired_elsewhere: "Bought Elsewhere",
      acquired_gift: "Received as Gift",
      acquired_propagated: "Self Propagated",
    },
    care: {
      water: "Watering",
      fertilize: "Fertilizing",
      repot: "Repotting",
      prune: "Pruning",
      pest_check: "Pest Inspection",
      days_unit: "{days} days",
      every_days: "Every {days} days",
      every_months: "Every {months} months",
      season_hot: "Hot Season (Mar - May)",
      season_rainy: "Rainy Season (Jun - Oct)",
      season_cool: "Cool Season (Nov - Feb)",
      schedule_explanation: "Adjusted for Thai climate, pot material, and placement",
      pot_size: "Pot Size",
      inches: "{inches} inches",
      overdue_days: "{count} days overdue",
      due_today: "Due today",
      due_in_days: "In {count} days",
      action_water_done: "Watered",
      action_mark_done: "Mark Done",
      action_snooze: "Snooze 1 Day",
      action_skip: "Skip Cycle",
      shop_owner_tip: "Shop Owner's Advice",
      common_problems: "Common Issues & Remedies",
      similar_plants: "Similar Plants",
      care_guide: "Care Guide",
      soil_mix: "Soil Mix Formula",
      fertilizer_note: "Fertilizer Recommendation",
      propagation: "Propagation",
    },
    garden: {
      title: "My Garden",
      subtitle: "Personal plant collection with intelligent climate-tailored reminders",
      add_plant: "Add Plant",
      my_plants_count: "{count} plants in your garden",
      empty_title: "Your garden is empty",
      empty_desc: "Add your first plant to get automatic watering reminders tailored to Bangkok weather!",
      step_1: "Choose Species",
      step_2: "Nickname & Source",
      step_3: "Pot & Diameter",
      step_4: "Placement",
      custom_species: "Other / Custom Species",
      custom_species_prompt: "Enter your plant species name",
      nickname_label: "Plant Nickname",
      nickname_placeholder: "e.g. Monty, Greenie",
      acquired_date: "Acquisition Date",
      acquired_source: "Acquired From",
      pot_size_label: "Pot Diameter (inches)",
      pot_material_label: "Pot Material",
      placement_label: "Location / Placement",
      preview_schedule: "Calculated Care Schedule for this Plant",
      submit_add: "Save to My Garden",
      archive_plant: "Archive Plant (Passed away / Gifted)",
      history_timeline: "Care Timeline History",
      calendar_30_days: "Next 30 Days Calendar",
      plant_details: "Plant Details",
      edit_plant: "Edit Plant Info",
      save_changes: "Save Changes",
      notes_label: "Care Notes",
      notes_placeholder: "Keep private notes about this plant, health issues, or repotting...",
    },
    today: {
      title: "Today's Tasks",
      subtitle: "Daily care tasks requiring attention today",
      overdue_section: "Overdue Tasks",
      today_section: "Due Today",
      upcoming_section: "Upcoming Soon",
      mark_all_done: "Mark All Done",
      all_done_title: "All caught up!",
      all_done_desc: "Every plant in your garden has received proper care and love today.",
      no_tasks: "No pending tasks for today. Enjoy your garden!",
      snooze_day: "Snooze 1 Day",
      skip_cycle: "Skip Cycle",
    },
    inquiry: {
      ask_shop: "Ask Shop About This Plant",
      intent_price: "Inquire Price & Sizes",
      intent_availability: "Check Availability",
      intent_care_help: "Care Help & Plant Doctor",
      intent_design_quote: "Garden Design Quote",
      chat_line_title: "Chat with Shop via LINE",
      ref_code_label: "Reference Code",
      copy_message: "Copy Message",
      message_copied: "Message copied! You can now paste it into LINE.",
      open_line_app: "Open LINE App",
      inquiry_sent: "Inquiry reference generated successfully",
      desktop_line_prompt: "Scan QR Code or add @treeforlife on LINE, then send this message:",
    },
    admin: {
      portal_title: "Admin Portal",
      species_mgmt: "Species Management",
      care_templates: "Care Formulas",
      problems: "Common Problems",
      inquiries: "Customer Inquiries",
      search_misses: "Search Misses",
      add_species: "Add New Species",
      edit_species: "Edit Species",
      save: "Save Changes",
      cancel: "Cancel",
      delete: "Delete",
      stock_status: "Stock Status",
      inline_edit_saved: "Status updated successfully",
      unauthorized: "You do not have permission to view this page (Staff or Admin required)",
      switch_to_admin: "Switch demo role to Admin or Staff to test",
      total_species: "{count} total species",
      query_count: "Searches",
      last_seen: "Last Queried",
      tab_inventory: "Species Inventory & Stock",
      tab_inquiries: "Customer Inquiries Log",
      tab_search_misses: "Search Misses & Demand",
      search_placeholder: "Search species (Thai/English/Scientific)...",
      filter_stock_all: "All Stock Statuses",
      stock_in_stock: "In Stock",
      stock_made_to_order: "Made to Order",
      stock_seasonal: "Seasonal",
      stock_hidden: "Hidden",
      last_updated: "Last Updated",
      ref_code: "Reference Code",
      customer_intent: "Customer Intent",
      source_page: "Source Page",
      payload_details: "Payload Details",
      missed_query: "Search Query",
      demand_count: "Search Count",
      stats_in_stock: "In Stock",
      stats_made_to_order: "Made to Order",
      stats_seasonal: "Seasonal",
      stats_inquiries: "Inquiries",
      stats_misses: "Search Misses",
      role_upgrade_desc: "This dashboard contains inventory controls, customer leads, and search demand analytics. Please switch to Staff or Admin to access.",
      switch_to_staff: "Switch to Staff Role",
      switch_to_admin_btn: "Switch to Admin Role",
      role_current: "Your current role is",
      action_update_success: "Stock status updated successfully",
      action_update_error: "Failed to update stock status. Please try again.",
      empty_inventory: "No species found matching your filter",
      empty_inquiries: "No customer inquiries recorded yet",
      empty_search_misses: "No search misses recorded yet",
    },
    toasts: {
      plant_added: "Plant added to your garden successfully! 🌿",
      task_done: "Care task marked as completed!",
      task_snoozed: "Task snoozed by 1 day",
      task_skipped: "Task skipped for this cycle",
      all_tasks_done: "All tasks marked complete with one click!",
      copied: "Copied to clipboard",
      role_switched: "Switched demo role to {role}",
      locale_switched: "Language changed to {lang}",
      theme_switched: "Theme changed to {theme}",
      guest_merged: "Transferred locally saved plants into your account",
      error_generic: "Something went wrong. Please try again.",
    },
    footer: {
      about_title: "TreeForLife Boutique Shop",
      about_desc: "A boutique plant nursery in Bangkok offering hand-picked plants nurtured and tested for the real Thai climate, backed by intelligent 3-season care schedules.",
      hours_label: "Opening Hours",
      hours_val: "Open Daily 09:00 - 18:00",
      location_label: "Location",
      location_val: "Bangkok, Thailand",
      line_cta_title: "Need Plant Advice?",
      line_cta_button: "Chat with Us on LINE",
      line_id: "LINE OA: @treeforlife",
      quick_links: "Quick Links",
      copyright: "© {year} TreeForLife. All rights reserved.",
      nurtured_note: "Nurtured with care · ดูแลด้วยใจ ปลูกด้วยรัก",
    },
  },
};

/**
 * Resolves a nested translation key (e.g. 'nav.home' or 'filters.light_full_sun')
 * with fallback to Thai (th) then English (en) then returning the key.
 */
export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");

  function findInDict(dict: Record<string, unknown>): string | undefined {
    let current: unknown = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof current === "string" ? current : undefined;
  }

  // 1. Try selected locale
  let text = findInDict(translations[locale] as unknown as Record<string, unknown>);

  // 2. Fallback to default Thai locale if missing
  if (text === undefined && locale !== "th") {
    text = findInDict(translations.th as unknown as Record<string, unknown>);
  }

  // 3. Fallback to English if missing in Thai
  if (text === undefined && locale !== "en") {
    text = findInDict(translations.en as unknown as Record<string, unknown>);
  }

  // 4. Return raw key if completely missing
  if (text === undefined) {
    return key;
  }

  // 5. Replace interpolation parameters: {paramName}
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
    }
  }

  return text;
}

export const t = getTranslation;
