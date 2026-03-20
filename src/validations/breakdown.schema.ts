import { z } from "zod";

export const raiseBreakdownSchema = z.object({
    body: z.object({
        assetId: z.number().int().positive("A valid Asset ID is required"),
        issue: z.string().min(5, "Please provide a detailed description of the issue"),
        photo: z.string().url("Invalid photo URL").optional().nullable(),
    }),
});

export type RaiseBreakdownInput = z.infer<typeof raiseBreakdownSchema>["body"];