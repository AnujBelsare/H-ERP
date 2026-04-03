import { pgTable, serial, integer, text, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { users } from "./users";
import { assets } from "./assets";

// 1. Export Breakdowns (The "Ticket")
export const breakdowns = pgTable("breakdowns", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    reportedBy: integer("reported_by").references(() => users.id).notNull(),
    issueDescription: text("issue_description").notNull(),
    photoUrl: text("photo_url"),
    status: varchar("status", { length: 50 }).default("open").notNull(), // open, assigned, closed
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Export Tasks (The "Work Order")
export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    breakdownId: integer("breakdown_id").references(() => breakdowns.id).notNull(),
    assignedTo: integer("assigned_to").references(() => users.id).notNull(),
    remarks: text("remarks"),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Export PPM Schedules (Preventive Maintenance)
export const ppmSchedules = pgTable("ppm_schedules", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").references(() => assets.id).notNull(),
    frequency: varchar("frequency", { length: 50 }).notNull(), 
    lastServiceDate: date("last_service_date"),
    nextServiceDate: date("next_service_date").notNull(),
    status: varchar("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Export Materials (Parts used)
export const materials = pgTable("materials", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id).notNull(),
    materialName: varchar("material_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull(),
});