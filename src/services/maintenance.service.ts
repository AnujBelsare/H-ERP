import { db } from "../drizzle/index";
import { tasks, breakdowns } from "../drizzle/schema/maintenance";
import { assets } from "../drizzle/schema/assets";
import { eq } from "drizzle-orm";
import { createNotification } from "./notification.service";

// 1. Mobile: Raise Breakdown (Updates Asset status automatically)
export const createBreakdown = async (data: { assetId: number; reportedBy: number; issueDescription: string }) => {
    return await db.transaction(async (tx) => {
        const [result] = await tx.insert(breakdowns).values({
            ...data,
            status: "open"
        }).returning();

        // Industry Standard: Sync asset status with breakdown report
        await tx.update(assets)
            .set({ status: 'breakdown' })
            .where(eq(assets.id, data.assetId));

        return result;
    });
};

// 2. Admin: Assign Technician (Combined logic with Notifications & Transactions)
export const assignTechnician = async (breakdownId: number, technicianId: number) => {
    return await db.transaction(async (tx) => {
        // Update breakdown status to 'assigned'
        await tx.update(breakdowns)
            .set({ status: "assigned" })
            .where(eq(breakdowns.id, breakdownId));

        // Create the task for the technician
        const [task] = await tx.insert(tasks).values({
            breakdownId,
            assignedTo: technicianId,
            status: "pending"
        }).returning();

        // Industry Standard: Trigger notification within the assignment flow
        await createNotification(
            technicianId,
            "New Task Assigned",
            `You have been assigned to Breakdown Ticket #${breakdownId}`
        );

        return task;
    });
};

// 3. Mobile: Get Technician's Tasks
export const getTasksByTechnician = async (userId: number) => {
    return await db.select()
        .from(tasks)
        .where(eq(tasks.assignedTo, userId));
};

// 4. Mobile: Complete Task (Closes both Task and Breakdown, resets Asset)
export const finishTask = async (taskId: number, remarks: string) => {
    return await db.transaction(async (tx) => {
        // Update task to completed
        const [updatedTask] = await tx.update(tasks)
            .set({
                status: "completed",
                remarks,
                completedAt: new Date()
            })
            .where(eq(tasks.id, taskId))
            .returning();

        if (!updatedTask) throw new Error("Task not found");

        // Fetch breakdown to get assetId
        const [breakdown] = await tx.select()
            .from(breakdowns)
            .where(eq(breakdowns.id, updatedTask.breakdownId))
            .limit(1);

        // Update breakdown to 'closed'
        await tx.update(breakdowns)
            .set({ status: "closed" })
            .where(eq(breakdowns.id, updatedTask.breakdownId));

        // Industry Standard: Reset asset status to 'functional' after repair
        await tx.update(assets)
            .set({ status: 'functional' })
            .where(eq(assets.id, breakdown.assetId));

        return updatedTask;
    });
};