import { pgTable, serial, integer, text, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { users } from "./users";
import { assets } from "./assets";
import { breakdowns } from "./breakdowns";

export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    breakdownId: integer("breakdown_id").references(() => breakdowns.id).notNull(),
    assignedTo: integer("assigned_to").references(() => users.id).notNull(),
    remarks: text("remarks"),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ppmSchedules = pgTable("ppm_schedules", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    frequency: varchar("frequency", { length: 50 }).notNull(), // e.g., "Monthly", "Quarterly"
    lastServiceDate: date("last_service_date"),
    nextServiceDate: date("next_service_date").notNull(),
    status: varchar("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});