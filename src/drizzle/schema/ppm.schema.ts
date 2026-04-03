import { z } from "zod";

export const createPPMSchema = z.object({
  body: z.object({
    assetId: z.number().int(),
    frequency: z.enum(["Monthly", "Quarterly", "Half-Yearly", "Yearly"]),
    nextServiceDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  }),
});