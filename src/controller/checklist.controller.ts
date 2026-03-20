import { Request, Response, NextFunction } from "express";
import * as checklistService from "../services/checklist.service";
import { successResponse } from "../utils/response";
import { SubmitChecklistInput } from "../validations/checklist.schema";

export const submitChecklist = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { assetId, checklistData } = req.body as SubmitChecklistInput;

        const technicianId = (req as any).user.id;

        const entry = await checklistService.submitAssetChecklist(
            assetId,
            technicianId,
            checklistData
        );

        return successResponse(res, entry, "Checklist submitted successfully", 201);
    } catch (err) {
        next(err);
    }
};