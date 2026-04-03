import { pgTable, serial, integer, text, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { users } from "./users";
import { assets } from "./assets";
import { breakdowns } from "./breakdowns";

// Tasks (Work Orders)
export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    breakdownId: integer("breakdown_id").references(() => breakdowns.id).notNull(),
    assignedTo: integer("assigned_to").references(() => users.id).notNull(),
    remarks: text("remarks"),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PPM Schedules (Preventive Maintenance)
export const ppmSchedules = pgTable("ppm_schedules", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    frequency: varchar("frequency", { length: 50 }).notNull(),
    lastServiceDate: date("last_service_date"),
    nextServiceDate: date("next_service_date").notNull(),
    status: varchar("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Materials (Parts used in tasks)
export const materials = pgTable("materials", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
});

export { breakdowns } from "./breakdowns";
