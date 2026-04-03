import { db } from "../drizzle/index";
import { sites, assetMappings } from "../drizzle/schema/sites";
import { assets } from "../drizzle/schema/assets";
import { eq } from "drizzle-orm";

export const createSite = async (data: { name: string; locationCode: string }) => {
  const [site] = await db.insert(sites).values(data).returning();
  return site;
};

export const getAllSites = async () => {
  return await db.select().from(sites);
};

export const mapAssetToSite = async (assetId: number, siteId: number) => {
  return await db.transaction(async (tx) => {
    // 1. Record the mapping history
    await tx.insert(assetMappings).values({ assetId, siteId });

    // 2. Update the asset's current location string to match the site name
    const [site] = await tx.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    
    const [updatedAsset] = await tx.update(assets)
      .set({ location: site.name })
      .where(eq(assets.id, assetId))
      .returning();

    return updatedAsset;
  });
};