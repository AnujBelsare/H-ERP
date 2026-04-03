import { db } from "../drizzle/index";
import { notifications } from "../drizzle/schema/notifications";
import { eq, and, desc } from "drizzle-orm";

export const createNotification = async (userId: number, title: string, message: string) => {
    return await db.insert(notifications).values({
        userId,
        title,
        message
    }).returning();
};

export const getUserNotifications = async (userId: number) => {
    return await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
};

export const markAsRead = async (notificationId: number) => {
    return await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId))
        .returning();
};