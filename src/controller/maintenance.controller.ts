import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "../services/maintenance.service";
import { successResponse } from "../utils/response";

// Extend Request type to include Multer's 'file' property
interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

/**
 * FIXED: Merged the two reportIssue functions into one
 * and fixed the req.file type error.
 */
export const reportIssue = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id; // From authGuard
        
        // Handle optional photo upload
        const photoUrl = req.file ? `/uploads/breakdowns/${req.file.filename}` : null;

        const data = { 
            assetId: Number(req.body.assetId),
            issueDescription: req.body.issueDescription,
            reportedBy: Number(userId),
            photoUrl: photoUrl 
        };

        const breakdown = await maintenanceService.createBreakdown(data);
        return successResponse(res, breakdown, "Breakdown reported successfully", 201);
    } catch (err) { 
        next(err); 
    }
};

export const assignTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { breakdownId, technicianId } = req.body;
        const task = await maintenanceService.assignTechnician(Number(breakdownId), Number(technicianId));
        return successResponse(res, task, "Technician assigned and task created");
    } catch (err) { 
        next(err); 
    }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const list = await maintenanceService.getTasksByTechnician(Number(userId));
        return successResponse(res, list, "Tasks retrieved");
    } catch (err) { 
        next(err); 
    }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = Number(req.params.id);
        const { remarks } = req.body;
        const result = await maintenanceService.finishTask(taskId, remarks);
        return successResponse(res, result, "Task marked as completed");
    } catch (err) { 
        next(err); 
    }
};

// POST /api/tasks/complete — takes task_id from body (xlsx spec)
export const completeTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { task_id, remarks } = req.body;
        const result = await maintenanceService.finishTask(Number(task_id), remarks ?? "");
        return successResponse(res, result, "Task marked as completed");
    } catch (err) {
        next(err);
    }
};
