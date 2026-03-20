import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";



export const assets = pgTable("assets", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    serialNumber: varchar("serial_number", { length: 100 }).unique().notNull(),
    qrCode: varchar("qr_code", { length: 255 }).unique().notNull(),
    location: varchar("location", { length: 100 }),
    status: varchar("status", { length: 50 }).default("functional").notNull(),
    lastMaintenance: timestamp("last_maintenance"),
    nextMaintenance: timestamp("next_maintenance"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;