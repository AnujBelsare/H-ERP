import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
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