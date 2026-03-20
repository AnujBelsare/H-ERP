import { assets, NewAsset } from "../drizzle/schema/assets";
import { db } from "../drizzle/index"
import { eq } from "drizzle-orm";


export const addAsset = async (data: NewAsset) => {
    const [newAsset] = await db.insert(assets).values(data).returning();

    return newAsset;
}

export const getAssets = async () => {
    return await db.select().from(assets);
}

export const getAssetByQR = async (qrCode: string) => {
    const asset = await db
        .select()
        .from(assets)
        .where(eq(assets.qrCode, qrCode))
        .limit(1);

    if (!asset.length) throw { status: 404, message: "Equipment not found for this QR code" };
    return asset[0];
}