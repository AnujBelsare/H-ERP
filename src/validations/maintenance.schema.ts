import { z } from "zod";

export const raiseBreakdownSchema = z.object({
  body: z.object({
    assetId: z.number({ message: "Asset ID must be a number" }),
    issue: z.string().min(5, "Issue description is too short"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  }),
});

export const assignTechnicianSchema = z.object({
  body: z.object({
    ticketId: z.number({ message: "Ticket ID is required" }),
    technicianId: z.number({ message: "Technician ID is required" }),
  }),
});

export const completeTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Task ID must be a valid number"),
  }),
  body: z.object({
    remarks: z.string().min(2, "Closing remarks are required"),
  }),
});