import { assets, NewAsset } from "../drizzle/schema/assets";
import { db } from "../drizzle/index";
import { eq } from "drizzle-orm";

export const addAsset = async (data: NewAsset) => {
  const [newAsset] = await db.insert(assets).values(data).returning();
  return newAsset;
};

export const getAssets = async () => {
  return await db.select().from(assets);
};

export const getAssetByQR = async (qrCode: string) => {
  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.qrCode, qrCode))
    .limit(1);

  if (!result.length) throw { status: 404, message: "Asset not found for this QR code" };
  return result[0];
};

export const updateAsset = async (id: string, data: Partial<NewAsset>) => {
  const numericId = Number(id);
  const [updated] = await db
    .update(assets)
    .set(data)
    .where(eq(assets.id, numericId))
    .returning();

  if (!updated) throw { status: 404, message: "Asset not found" };
  return updated;
};

export const deleteAsset = async (id: string) => {
  const numericId = Number(id);
  const [deleted] = await db
    .delete(assets)
    .where(eq(assets.id, numericId))
    .returning();

  if (!deleted) throw { status: 404, message: "Asset not found" };
  return deleted;
};