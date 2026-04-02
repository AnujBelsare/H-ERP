import { z } from "zod";

const assetBody = z.object({
  name: z.string().min(2, "Asset name is required"),
  category: z.string().min(2, "Category is required"),
  serialNumber: z.string().min(3, "Serial number is required"),
  qrCode: z.string().min(3, "QR Code identifier is required"),
  location: z.string().optional(),
  status: z.enum(["functional", "breakdown", "maintenance"]).default("functional"),
});

export const createAssetSchema = z.object({
  body: assetBody,
});

export const updateAssetSchema = z.object({
  params: z.object({
    // Ensures the ID is a string of digits before reaching the service
    id: z.string().regex(/^\d+$/, "ID must be a valid number"),
  }),
  body: assetBody.partial(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>["body"];
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>["body"];