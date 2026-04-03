import { db } from "../drizzle/index";
import { assets } from "../drizzle/schema/assets";
import { breakdowns, tasks } from "../drizzle/schema/maintenance";
import { eq, sql, count } from "drizzle-orm";

export const getAdminStats = async () => {
    // Run multiple counts in parallel for performance
    const [assetCount] = await db.select({ value: count() }).from(assets);
    const [activeBreakdowns] = await db.select({ value: count() })
        .from(breakdowns)
        .where(eq(breakdowns.status, "open"));
    
    const [pendingTasks] = await db.select({ value: count() })
        .from(tasks)
        .where(eq(tasks.status, "pending"));

    // Grouping assets by status for a chart
    const statusDistribution = await db.select({
        status: assets.status,
        count: count(),
    })
    .from(assets)
    .groupBy(assets.status);

    return {
        totalAssets: assetCount.value,
        openTickets: activeBreakdowns.value,
        pendingTasks: pendingTasks.value,
        charts: {
            assetStatus: statusDistribution
        }
    };
};

export const getMaintenanceReport = async (type: string) => {
    if (type === "breakdown") {
        return await db.select().from(breakdowns).orderBy(breakdowns.createdAt);
    }
    return await db.select().from(tasks).orderBy(tasks.createdAt);
};