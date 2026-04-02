import { db } from "../drizzle/index";
import { breakdowns, tasks } from "../drizzle/schema/maintenance";
import { eq } from "drizzle-orm";

// Mobile: Raise Breakdown
export const createBreakdown = async (data: { assetId: number; reportedBy: number; issueDescription: string }) => {
    const [result] = await db.insert(breakdowns).values(data).returning();
    return result;
};

// Admin: Assign Technician (Creates a Task)
export const assignTechnician = async (breakdownId: number, technicianId: number) => {
    // 1. Update breakdown status to 'assigned'
    await db.update(breakdowns)
        .set({ status: "assigned" })
        .where(eq(breakdowns.id, breakdownId));

    // 2. Create the task for the technician
    const [task] = await db.insert(tasks).values({
        breakdownId,
        assignedTo: technicianId,
        status: "pending"
    }).returning();

    return task;
};

// Mobile: Get Technician's Tasks
export const getTasksByTechnician = async (userId: number) => {
    return await db.select()
        .from(tasks)
        .where(eq(tasks.assignedTo, userId));
};

// Mobile: Complete Task
export const finishTask = async (taskId: number, remarks: string) => {
    const [updatedTask] = await db.update(tasks)
        .set({ 
            status: "completed", 
            remarks, 
            completedAt: new Date() 
        })
        .where(eq(tasks.id, taskId))
        .returning();

    // Optionally update the breakdown to 'closed' here if needed
    return updatedTask;
};