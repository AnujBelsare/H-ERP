import { Request, Response, NextFunction } from "express";
import * as ppmService from "../services/ppm.service";
import { successResponse } from "../utils/response";

export const addPPM = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schedule = await ppmService.schedulePPM(req.body);
        return successResponse(res, schedule, "Maintenance scheduled successfully", 201);
    } catch (err) { next(err); }
};

export const getPPMByAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assetId = Number(req.params.assetId);
        const data = await ppmService.getAssetPPM(assetId);
        return successResponse(res, data, "PPM schedules retrieved");
    } catch (err) { next(err); }
};