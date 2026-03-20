import { db } from '../drizzle/index';
import { breakdowns } from '../drizzle/schema/breakdowns';
import { assets } from '../drizzle/schema/assets';
import { eq } from 'drizzle-orm';

export const createBreakdown = async (data: any) => {
    return await db.transaction(async (tx) => {
        const [ticket] = await tx.insert(breakdowns).values(data).returning();

        await tx.update(assets)
            .set({ status: 'breakdown' })
            .where(eq(assets.id, data.assetId));

        return ticket;
    });
};