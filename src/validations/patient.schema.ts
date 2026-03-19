import { z } from "zod";

export const createPatientSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        dob: z.string(),
        age: z.number().min(0).max(120),
        gender: z.enum(["Male", "Female", "Other"]),
        phone: z.string().min(10),
        email: z.string().email().optional(),
        address: z.string(),
        bloodGroup: z.string().optional(),
        allergies: z.string().optional(),
        faceData: z.string().optional(),
    }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>["body"];