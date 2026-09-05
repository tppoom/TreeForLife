export const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  line_user_id TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  timezone TEXT NOT NULL DEFAULT 'Asia/Bangkok',
  notify_web_push BOOLEAN NOT NULL DEFAULT true,
  notify_line BOOLEAN NOT NULL DEFAULT true,
  notify_hour INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_sci TEXT NOT NULL,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
  family TEXT NOT NULL,
  summary TEXT NOT NULL,
  light TEXT NOT NULL,
  water_need TEXT NOT NULL,
  placement JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty INTEGER NOT NULL DEFAULT 1,
  pet_safe TEXT NOT NULL DEFAULT 'unknown',
  mature_size TEXT NOT NULL DEFAULT 'md',
  mature_height_cm INTEGER,
  growth_rate TEXT NOT NULL DEFAULT 'medium',
  soil_mix TEXT NOT NULL,
  fertilizer_note TEXT,
  propagation TEXT,
  shop_note TEXT NOT NULL,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  price_range_internal TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  alt_th TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  credit TEXT NOT NULL DEFAULT 'ถ่ายที่ร้าน'
);

CREATE TABLE IF NOT EXISTS species_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  symptom_th TEXT NOT NULL,
  cause_th TEXT NOT NULL,
  fix_th TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS care_templates (
  species_id UUID PRIMARY KEY REFERENCES species(id) ON DELETE CASCADE,
  water_days_hot INTEGER NOT NULL,
  water_days_rainy INTEGER NOT NULL,
  water_days_cool INTEGER NOT NULL,
  fertilize_days INTEGER,
  fertilize_pause_months JSONB NOT NULL DEFAULT '[]'::jsonb,
  repot_months INTEGER,
  prune_days INTEGER,
  pest_check_days INTEGER NOT NULL DEFAULT 14,
  notes_th TEXT
);

CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  custom_species_name TEXT,
  nickname TEXT NOT NULL,
  photo_url TEXT,
  acquired_at DATE NOT NULL,
  acquired_from TEXT NOT NULL DEFAULT 'shop',
  pot_size_inch NUMERIC NOT NULL DEFAULT 6,
  pot_material TEXT NOT NULL DEFAULT 'plastic',
  placement TEXT NOT NULL DEFAULT 'indoor_window',
  custom_water_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'water',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  snooze_count INTEGER NOT NULL DEFAULT 0,
  done_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  photo_url TEXT,
  source TEXT NOT NULL DEFAULT 'app'
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  species_id UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_token TEXT,
  source_page TEXT NOT NULL,
  ref_code TEXT NOT NULL UNIQUE,
  intent TEXT NOT NULL DEFAULT 'care_help',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_misses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
