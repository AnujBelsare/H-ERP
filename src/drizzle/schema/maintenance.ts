import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { users } from "./users";

export const breakdowns = pgTable("breakdowns", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    reportedBy: integer("reported_by").references(() => users.id).notNull(),
    issueDescription: text("issue_description").notNull(),
    photoUrl: text("photo_url"),
    status: varchar("status", { length: 50 }).default("open").notNull(), // open, assigned, closed
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    breakdownId: integer("breakdown_id").references(() => breakdowns.id).notNull(),
    assignedTo: integer("assigned_to").references(() => users.id).notNull(),
    remarks: text("remarks"),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});