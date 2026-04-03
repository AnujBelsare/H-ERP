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

export const getAllBreakdowns = async (status?: string) => {
    if (status) {
        return await db.select().from(breakdowns).where(eq(breakdowns.status, status));
    }
    return await db.select().from(breakdowns);
};

export const approveBreakdown = async (ticketId: number) => {
    const [updated] = await db.update(breakdowns)
        .set({ status: 'approved' })
        .where(eq(breakdowns.id, ticketId))
        .returning();
    if (!updated) throw { status: 404, message: 'Breakdown ticket not found' };
    return updated;
};
