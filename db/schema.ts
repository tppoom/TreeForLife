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
} from "drizzle-orm/pg-core";
import { relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

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
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Species Media
export const speciesMedia = pgTable("species_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  altTh: text("alt_th").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  credit: text("credit").notNull().default("ถ่ายที่ร้าน"),
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
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("care_tasks_plant_type_due_unique").on(table.userPlantId, table.type, table.dueDate),
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
});

// Favorites (Guest + User)
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestToken: text("guest_token"),
  speciesId: uuid("species_id").notNull().references(() => species.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

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
});

// Search Misses (Business Intelligence for Shop Owner)
export const searchMisses = pgTable("search_misses", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull().unique(),
  count: integer("count").notNull().default(1),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userPlants: many(userPlants),
  favorites: many(favorites),
  inquiries: many(inquiries),
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
