import { Request, Response, NextFunction } from "express";
import * as notifService from "../services/notification.service";
import { successResponse } from "../utils/response";

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const list = await notifService.getUserNotifications(Number(userId));
        return successResponse(res, list, "Notifications retrieved");
    } catch (err) { next(err); }
};

export const readNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const result = await notifService.markAsRead(id);
        return successResponse(res, result, "Notification marked as read");
    } catch (err) { next(err); }
};