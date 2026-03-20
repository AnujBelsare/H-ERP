import { z } from "zod";

export const submitChecklistSchema = z.object({
    body: z.object({
        assetId: z.number().int().positive("Valid Asset ID required"),
        checklistData: z.record(z.string(), z.any()).refine((obj) => Object.keys(obj).length > 0, {
            message: "Checklist data cannot be empty",
        }),
    }),
});

export type SubmitChecklistInput = z.infer<typeof submitChecklistSchema>["body"];