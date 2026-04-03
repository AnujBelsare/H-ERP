import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";
import { successResponse } from "../utils/response";

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashboardService.getAdminStats();
        return successResponse(res, stats, "Dashboard stats retrieved");
    } catch (err) { next(err); }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = String(req.query.type || "breakdown");
        const data = await dashboardService.getMaintenanceReport(type);
        return successResponse(res, data, `Report for ${type} generated`);
    } catch (err) { next(err); }
};