import { z } from "zod";

export const createAssetSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Asset name is required"),
        category: z.string().min(2, "Category is required"),
        serialNumber: z.string().min(3, "Serial number is required"),
        qrCode: z.string().min(3, "QR Code identifier is required"),
        location: z.string().optional(),
        status: z.enum(["functional", "breakdown", "maintenance"]).optional(),
    }),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>["body"];