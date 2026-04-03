import { db } from "../drizzle/index";
import { ppmSchedules } from "../drizzle/schema/maintenance";
import { eq } from "drizzle-orm";

export const schedulePPM = async (data: { assetId: number; frequency: string; nextServiceDate: string }) => {
    const [schedule] = await db.insert(ppmSchedules).values({
        assetId: data.assetId,
        frequency: data.frequency,
        nextServiceDate: data.nextServiceDate,
    }).returning();
    return schedule;
};

export const getAssetPPM = async (assetId: number) => {
    return await db.select()
        .from(ppmSchedules)
        .where(eq(ppmSchedules.assetId, assetId));
};