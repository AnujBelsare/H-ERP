import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "../services/maintenance.service";
import { successResponse } from "../utils/response";

export const reportIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id; // From authGuard
        const data = { ...req.body, reportedBy: Number(userId) };
        const breakdown = await maintenanceService.createBreakdown(data);
        return successResponse(res, breakdown, "Breakdown reported", 201);
    } catch (err) { next(err); }
};

export const assignTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { breakdownId, technicianId } = req.body;
        const task = await maintenanceService.assignTechnician(Number(breakdownId), Number(technicianId));
        return successResponse(res, task, "Technician assigned and task created");
    } catch (err) { next(err); }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const list = await maintenanceService.getTasksByTechnician(Number(userId));
        return successResponse(res, list, "Tasks retrieved");
    } catch (err) { next(err); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = Number(req.params.id);
        const { remarks } = req.body;
        const result = await maintenanceService.finishTask(taskId, remarks);
        return successResponse(res, result, "Task marked as completed");
    } catch (err) { next(err); }
};