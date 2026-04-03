import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { assets } from "./assets";

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Operation Theater 1"
  locationCode: varchar("location_code", { length: 50 }).unique(), // e.g., "OT-01"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assetMappings = pgTable("asset_mappings", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  mappedAt: timestamp("mapped_at").defaultNow().notNull(),
});