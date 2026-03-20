import { pgTable, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { users } from "./users";

export const checklists = pgTable("checklists", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    technicianId: integer("technician_id").references(() => users.id).notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});