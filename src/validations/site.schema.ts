import { z } from "zod";

export const createSiteSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Site name is required"),
    locationCode: z.string().min(2, "Location code is required"),
  }),
});

export const mapAssetSchema = z.object({
  body: z.object({
    assetId: z.number({ message: "Asset ID must be a number" }),
    siteId: z.number({ message: "Site ID must be a number" }),
  }),
});