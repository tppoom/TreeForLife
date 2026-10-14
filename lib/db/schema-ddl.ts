export const SCHEMA_DDL = `
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  line_user_id TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  session_version INTEGER NOT NULL DEFAULT 1,
  line_friend BOOLEAN,
  deleted_at TIMESTAMPTZ,
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
  search_text TEXT,
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
  reminder_opt_in_asked_at TIMESTAMPTZ,
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
  nudge_dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT care_tasks_plant_type_due_unique UNIQUE (user_plant_id, type, due_date)
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
  normalized_query TEXT,
  suggested_species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_token TEXT,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  task_count INTEGER NOT NULL DEFAULT 0,
  ok BOOLEAN NOT NULL,
  error TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cron_runs (
  job TEXT NOT NULL,
  run_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  cursor TEXT,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  PRIMARY KEY (job, run_date)
);

CREATE TABLE IF NOT EXISTS line_events_seen (
  event_id TEXT PRIMARY KEY,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aftercare_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id UUID NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  day_mark INTEGER NOT NULL,
  due_date DATE NOT NULL,
  answer TEXT,
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  CONSTRAINT aftercare_unique UNIQUE (user_plant_id, day_mark)
);

CREATE INDEX IF NOT EXISTS user_plants_user_idx   ON user_plants (user_id)     WHERE is_active;
CREATE INDEX IF NOT EXISTS user_plants_guest_idx  ON user_plants (guest_token) WHERE is_active;
CREATE INDEX IF NOT EXISTS care_tasks_due_idx     ON care_tasks (due_date, status);
CREATE INDEX IF NOT EXISTS care_logs_plant_idx    ON care_logs (user_plant_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_created_idx  ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS species_stock_idx      ON species (stock_status);
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_species_uq  ON favorites (user_id, species_id)     WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS favorites_guest_species_uq ON favorites (guest_token, species_id) WHERE guest_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx   ON push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_guest_idx  ON push_subscriptions (guest_token);
CREATE INDEX IF NOT EXISTS notifications_log_month_idx   ON notifications_log (channel, sent_at);
CREATE INDEX IF NOT EXISTS aftercare_due_idx             ON aftercare_checkins (due_date, answer);

-- Additive migrations for existing databases (ADR-03)
ALTER TABLE species ADD COLUMN IF NOT EXISTS search_text TEXT;
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS normalized_query TEXT;
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS suggested_species_id UUID REFERENCES species(id) ON DELETE SET NULL;
ALTER TABLE search_misses ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE species_media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_friend BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE user_plants ADD COLUMN IF NOT EXISTS reminder_opt_in_asked_at TIMESTAMPTZ;
ALTER TABLE care_tasks ADD COLUMN IF NOT EXISTS nudge_dismissed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS species_search_trgm    ON species USING gin (search_text gin_trgm_ops);
`;
