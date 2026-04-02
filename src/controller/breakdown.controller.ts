import { Request, Response, NextFunction } from "express";
import * as breakdownService from "../services/breakdown.service";
import { successResponse } from "../utils/response";
import { RaiseBreakdownInput } from "../validations/breakdown.schema";

interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        role: "admin" | "doctor" | "receptionist" | "technician";
    };
}

export const raiseBreakdown = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { assetId, issue, photo } = req.body as RaiseBreakdownInput;

        const reportedBy = req.user!.id;

        const ticket = await breakdownService.createBreakdown({
            assetId,
            reportedBy,
            issueDescription: issue,
            photoUrl: photo,
        });

        return successResponse(res, ticket, "Breakdown ticket raised successfully", 201);
    } catch (err) {
        next(err);
    }
};