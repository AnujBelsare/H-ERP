import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { users } from "./users";

export const breakdowns = pgTable("breakdowns", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    reportedBy: integer("reported_by").references(() => users.id).notNull(),
    issueDescription: text("issue_description").notNull(),
    photoUrl: text("photo_url"),
    status: varchar("status", { length: 50 }).default("open").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});