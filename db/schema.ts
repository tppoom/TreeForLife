import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  uuid,
  jsonb,
  date,
  pgEnum,
  unique,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["customer", "staff", "admin"]);
export const lightEnum = pgEnum("light", ["full_sun", "partial", "shade", "indoor_bright", "low_light"]);
export const waterNeedEnum = pgEnum("water_need", ["low", "medium", "high"]);
export const petSafeEnum = pgEnum("pet_safe", ["safe", "toxic", "unknown"]);
export const matureSizeEnum = pgEnum("mature_size", ["xs", "sm", "md", "lg", "xl"]);
export const growthRateEnum = pgEnum("growth_rate", ["slow", "medium", "fast"]);
export const stockStatusEnum = pgEnum("stock_status", ["in_stock", "made_to_order", "seasonal", "hidden"]);
export const potMaterialEnum = pgEnum("pot_material", ["terracotta", "plastic", "ceramic_glazed", "cement", "hanging"]);
export const placementEnum = pgEnum("placement", ["outdoor_sun", "balcony_shade", "indoor_window", "indoor_far", "air_con"]);
export const acquiredFromEnum = pgEnum("acquired_from", ["shop", "elsewhere", "gift", "propagated"]);
export const taskTypeEnum = pgEnum("task_type", ["water", "fertilize", "repot", "prune", "pest_check"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "done", "skipped", "snoozed"]);
export const inquiryIntentEnum = pgEnum("inquiry_intent", ["price", "availability", "care_help", "design_quote"]);
export const problemSeverityEnum = pgEnum("problem_severity", ["low", "medium", "high"]);
export const careLogSourceEnum = pgEnum("care_log_source", ["app", "line", "backfill"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  email: text("email").unique(),
  lineUserId: text("line_user_id").unique(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("customer"), // customer, staff, admin
  sessionVersion: integer("session_version").default(1).notNull(),
  lineFriend: boolean("line_friend"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  timezone: text("timezone").default("Asia/Bangkok").notNull(),
  notifyWebPush: boolean("notify_web_push").default(true).notNull(),
  notifyLine: boolean("notify_line").default(true).notNull(),
  notifyHour: integer("notify_hour").default(7).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

// Species table
export const species = pgTable("species", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameTh: text("name_th").notNull(),
  nameEn: text("name_en").notNull(),
  nameSci: text("name_sci").notNull(),
  aliases: jsonb("aliases").$type<string[]>().default([]).notNull(),
  family: text("family").notNull(),
  summary: text("summary").notNull(),
  light: text("light").notNull(), // full_sun, partial, shade, indoor_bright, low_light
  waterNeed: text("water_need").notNull(), // low, medium, high
  placement: jsonb("placement").$type<string[]>().default([]).notNull(), // indoor, outdoor, balcony, bathroom
  difficulty: integer("difficulty").notNull().default(1), // 1 - 5
  petSafe: text("pet_safe").notNull().default("unknown"), // safe, toxic, unknown
  matureSize: text("mature_size").notNull().default("md"), // xs, sm, md, lg, xl
  matureHeightCm: integer("mature_height_cm"),
  growthRate: text("growth_rate").notNull().default("medium"), // slow, medium, fast
  soilMix: text("soil_mix").notNull(),
  fertilizerNote: text("fertilizer_note"),
  propagation: text("propagation"),
  shopNote: text("shop_note").notNull(), // Authentic shop owner experience & tips
  stockStatus: text("stock_status").notNull().default("in_stock"), // in_stock, made_to_order, seasonal, hidden
  priceRangeInternal: text("price_range_internal"),
  searchText: text("search_text"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("species_stock_idx").on(table.stockStatus),
]);

// Species Media
export const speciesMedia = pgTable("species_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  altTh: text("alt_th").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  credit: text("credit").notNull().default("ถ่ายที่ร้าน"),
  storagePath: text("storage_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Species Problems (Common FAQs & Diagnoses)
export const speciesProblems = pgTable("species_problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  symptomTh: text("symptom_th").notNull(),
  causeTh: text("cause_th").notNull(),
  fixTh: text("fix_th").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high
  sortOrder: integer("sort_order").notNull().default(0),
});

// Care Templates (1 row per species)
export const careTemplates = pgTable("care_templates", {
  speciesId: uuid("species_id").primaryKey().references(() => species.id, { onDelete: "cascade" }),
  waterDaysHot: integer("water_days_hot").notNull(), // Mar - May
  waterDaysRainy: integer("water_days_rainy").notNull(), // Jun - Oct
  waterDaysCool: integer("water_days_cool").notNull(), // Nov - Feb
  fertilizeDays: integer("fertilize_days"),
  fertilizePauseMonths: jsonb("fertilize_pause_months").$type<number[]>().default([]).notNull(),
  repotMonths: integer("repot_months"),
  pruneDays: integer("prune_days"),
  pestCheckDays: integer("pest_check_days").notNull().default(14),
  notesTh: text("notes_th"),
});

// User Plants (My Garden)
export const userPlants = pgTable("user_plants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestToken: text("guest_token"),
  speciesId: uuid("species_id").references(() => species.id, { onDelete: "set null" }),
  customSpeciesName: text("custom_species_name"),
  nickname: text("nickname").notNull(),
  photoUrl: text("photo_url"),
  acquiredAt: date("acquired_at").notNull(),
  acquiredFrom: text("acquired_from").notNull().default("shop"), // shop, elsewhere, gift, propagated
  potSizeInch: numeric("pot_size_inch").notNull().default("6"),
  potMaterial: text("pot_material").notNull().default("plastic"), // terracotta, plastic, ceramic_glazed, cement, hanging
  placement: text("placement").notNull().default("indoor_window"), // outdoor_sun, balcony_shade, indoor_window, indoor_far, air_con
  customWaterDays: integer("custom_water_days"),
  isActive: boolean("is_active").notNull().default(true),
  reminderOptInAskedAt: timestamp("reminder_opt_in_asked_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_plants_user_idx").on(table.userId).where(sql`${table.isActive} = true`),
  index("user_plants_guest_idx").on(table.guestToken).where(sql`${table.isActive} = true`),
]);

// Care Tasks
export const careTasks = pgTable("care_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userPlantId: uuid("user_plant_id").notNull().references(() => userPlants.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("water"), // water, fertilize, repot, prune, pest_check
  dueDate: date("due_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, done, skipped, snoozed
  snoozeCount: integer("snooze_count").notNull().default(0),
  doneAt: timestamp("done_at", { withTimezone: true }),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  nudgeDismissedAt: timestamp("nudge_dismissed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("care_tasks_plant_type_due_unique").on(table.userPlantId, table.type, table.dueDate),
  index("care_tasks_due_idx").on(table.dueDate, table.status),
]);

// Care Logs (Timeline History)
export const careLogs = pgTable("care_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userPlantId: uuid("user_plant_id").notNull().references(() => userPlants.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  performedAt: timestamp("performed_at", { withTimezone: true }).defaultNow().notNull(),
  note: text("note"),
  photoUrl: text("photo_url"),
  source: text("source").notNull().default("app"), // app, line, backfill
}, (table) => [
  index("care_logs_plant_idx").on(table.userPlantId, table.performedAt.desc()),
]);

// Favorites (Guest + User)
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestToken: text("guest_token"),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("favorites_user_species_uq").on(table.userId, table.speciesId).where(sql`${table.userId} IS NOT NULL`),
  uniqueIndex("favorites_guest_species_uq").on(table.guestToken, table.speciesId).where(sql`${table.guestToken} IS NOT NULL`),
]);

// Inquiries (Shop metric #1 & LINE Handoffs)
export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id").references(() => species.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestToken: text("guest_token"),
  sourcePage: text("source_page").notNull(),
  refCode: text("ref_code").notNull().unique(), // e.g. TFL-4K9P
  intent: text("intent").notNull().default("care_help"), // price, availability, care_help, design_quote
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("inquiries_created_idx").on(table.createdAt.desc()),
]);

// Search Misses (Business Intelligence for Shop Owner)
export const searchMisses = pgTable("search_misses", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull().unique(),
  count: integer("count").notNull().default(1),
  normalizedQuery: text("normalized_query"),
  suggestedSpeciesId: uuid("suggested_species_id").references(() => species.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

// Rate Limits
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.key, table.windowStart] }),
  ]
);

// Push Subscriptions (Web Push)
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestToken: text("guest_token"),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
}, (table) => [
  index("push_subscriptions_user_idx").on(table.userId),
  index("push_subscriptions_guest_idx").on(table.guestToken),
]);

// Notifications Log (Audit & Monthly LINE Quota Cap)
export const notificationsLog = pgTable("notifications_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestToken: text("guest_token"),
  channel: text("channel").notNull(), // web_push | line
  kind: text("kind").notNull(), // daily_digest | aftercare | supplies | test | admin_alert
  taskCount: integer("task_count").notNull().default(0),
  ok: boolean("ok").notNull(),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("notifications_log_month_idx").on(table.channel, table.sentAt),
]);

// Cron Runs (Idempotency & Cursor Checkpointing)
export const cronRuns = pgTable("cron_runs", {
  job: text("job").notNull(),
  runDate: date("run_date").notNull(),
  status: text("status").notNull().default("running"), // running | done | failed
  cursor: text("cursor"),
  stats: jsonb("stats").$type<Record<string, unknown>>().default({}).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => [
  primaryKey({ columns: [table.job, table.runDate] }),
]);

// LINE Events Seen (Deduplication for Webhooks)
export const lineEventsSeen = pgTable("line_events_seen", {
  eventId: text("event_id").primaryKey(),
  seenAt: timestamp("seen_at", { withTimezone: true }).defaultNow().notNull(),
});

// Aftercare Check-ins (F06: 3 / 14 / 30 Days Check-ins)
export const aftercareCheckins = pgTable("aftercare_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userPlantId: uuid("user_plant_id").notNull().references(() => userPlants.id, { onDelete: "cascade" }),
  dayMark: integer("day_mark").notNull(), // 3 | 14 | 30
  dueDate: date("due_date").notNull(),
  answer: text("answer"), // good | unsure | bad | null
  symptoms: jsonb("symptoms").$type<string[]>().default([]).notNull(),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "set null" }),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
}, (table) => [
  unique("aftercare_unique").on(table.userPlantId, table.dayMark),
  index("aftercare_due_idx").on(table.dueDate, table.answer),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userPlants: many(userPlants),
  favorites: many(favorites),
  inquiries: many(inquiries),
  pushSubscriptions: many(pushSubscriptions),
  notifications: many(notificationsLog),
}));

export const speciesRelations = relations(species, ({ one, many }) => ({
  media: many(speciesMedia),
  problems: many(speciesProblems),
  careTemplate: one(careTemplates, {
    fields: [species.id],
    references: [careTemplates.speciesId],
  }),
  userPlants: many(userPlants),
  favorites: many(favorites),
  inquiries: many(inquiries),
}));

export const speciesMediaRelations = relations(speciesMedia, ({ one }) => ({
  species: one(species, {
    fields: [speciesMedia.speciesId],
    references: [species.id],
  }),
}));

export const speciesProblemsRelations = relations(speciesProblems, ({ one }) => ({
  species: one(species, {
    fields: [speciesProblems.speciesId],
    references: [species.id],
  }),
}));

export const careTemplatesRelations = relations(careTemplates, ({ one }) => ({
  species: one(species, {
    fields: [careTemplates.speciesId],
    references: [species.id],
  }),
}));

export const userPlantsRelations = relations(userPlants, ({ one, many }) => ({
  user: one(users, {
    fields: [userPlants.userId],
    references: [users.id],
  }),
  species: one(species, {
    fields: [userPlants.speciesId],
    references: [species.id],
  }),
  careTasks: many(careTasks),
  careLogs: many(careLogs),
  aftercareCheckins: many(aftercareCheckins),
}));

export const careTasksRelations = relations(careTasks, ({ one }) => ({
  userPlant: one(userPlants, {
    fields: [careTasks.userPlantId],
    references: [userPlants.id],
  }),
}));

export const careLogsRelations = relations(careLogs, ({ one }) => ({
  userPlant: one(userPlants, {
    fields: [careLogs.userPlantId],
    references: [userPlants.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  species: one(species, {
    fields: [favorites.speciesId],
    references: [species.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  species: one(species, {
    fields: [inquiries.speciesId],
    references: [species.id],
  }),
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}));

export const aftercareCheckinsRelations = relations(aftercareCheckins, ({ one }) => ({
  userPlant: one(userPlants, {
    fields: [aftercareCheckins.userPlantId],
    references: [userPlants.id],
  }),
  inquiry: one(inquiries, {
    fields: [aftercareCheckins.inquiryId],
    references: [inquiries.id],
  }),
}));

// Inferred model types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Species = InferSelectModel<typeof species>;
export type NewSpecies = InferInsertModel<typeof species>;

export type SpeciesMedia = InferSelectModel<typeof speciesMedia>;
export type NewSpeciesMedia = InferInsertModel<typeof speciesMedia>;

export type SpeciesProblem = InferSelectModel<typeof speciesProblems>;
export type NewSpeciesProblem = InferInsertModel<typeof speciesProblems>;

export type CareTemplate = InferSelectModel<typeof careTemplates>;
export type NewCareTemplate = InferInsertModel<typeof careTemplates>;

export type UserPlant = InferSelectModel<typeof userPlants>;
export type NewUserPlant = InferInsertModel<typeof userPlants>;

export type CareTask = InferSelectModel<typeof careTasks>;
export type NewCareTask = InferInsertModel<typeof careTasks>;

export type CareLog = InferSelectModel<typeof careLogs>;
export type NewCareLog = InferInsertModel<typeof careLogs>;

export type Favorite = InferSelectModel<typeof favorites>;
export type NewFavorite = InferInsertModel<typeof favorites>;

export type Inquiry = InferSelectModel<typeof inquiries>;
export type NewInquiry = InferInsertModel<typeof inquiries>;

export type SearchMiss = InferSelectModel<typeof searchMisses>;
export type NewSearchMiss = InferInsertModel<typeof searchMisses>;

export type RateLimit = InferSelectModel<typeof rateLimits>;
export type NewRateLimit = InferInsertModel<typeof rateLimits>;

export type PushSubscription = InferSelectModel<typeof pushSubscriptions>;
export type NewPushSubscription = InferInsertModel<typeof pushSubscriptions>;

export type NotificationLog = InferSelectModel<typeof notificationsLog>;
export type NewNotificationLog = InferInsertModel<typeof notificationsLog>;

export type CronRun = InferSelectModel<typeof cronRuns>;
export type NewCronRun = InferInsertModel<typeof cronRuns>;

export type LineEventSeen = InferSelectModel<typeof lineEventsSeen>;
export type NewLineEventSeen = InferInsertModel<typeof lineEventsSeen>;

export type AftercareCheckin = InferSelectModel<typeof aftercareCheckins>;
export type NewAftercareCheckin = InferInsertModel<typeof aftercareCheckins>;
