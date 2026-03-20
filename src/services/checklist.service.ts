import { db } from '../drizzle/index';
import { checklists } from '../drizzle/schema/checklists';
import { assets } from '../drizzle/schema/assets';
import { eq } from 'drizzle-orm';

export const submitAssetChecklist = async (assetId: number, technicianId: number, data: any) => {
  return await db.transaction(async (tx) => {
    const [entry] = await tx.insert(checklists).values({
      assetId,
      technicianId,
      data
    }).returning();

    await tx.update(assets)
      .set({ lastMaintenance: new Date() })
      .where(eq(assets.id, assetId));

    return entry;
  });
};