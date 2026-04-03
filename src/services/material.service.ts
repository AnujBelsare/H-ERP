import { db } from "../drizzle/index";
import { materials } from "../drizzle/schema/maintenance";
import { eq } from "drizzle-orm";

export const addMaterial = async (data: { taskId: number; materialName: string; quantity: number }) => {
    const [entry] = await db.insert(materials).values(data).returning();
    return entry;
};

export const getMaterialsByTask = async (taskId: number) => {
    return await db.select().from(materials).where(eq(materials.taskId, taskId));
};
