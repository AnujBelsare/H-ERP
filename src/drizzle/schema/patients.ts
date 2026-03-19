import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { date, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";


export const patients = pgTable("patients", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    dob: date("dob").notNull(),
    age: integer("age").notNull(),
    gender: varchar("gender", { length: 20 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    email: varchar("email", { length: 255 }),
    address: text("address").notNull(),
    bloodGroup: varchar("blood_group", { length: 5 }),
    allergies: text("allergies"),
    faceData: text("face_data"),
    createdAt: timestamp("created_at").defaultNow(),
})

export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;