import { Request, Response, NextFunction } from "express";
import * as breakdownService from "../services/breakdown.service";
import { successResponse } from "../utils/response";
import { RaiseBreakdownInput } from "../validations/breakdown.schema";

export const raiseBreakdown = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { assetId, issue, photo } = req.body as RaiseBreakdownInput;
        const ticket = await breakdownService.createBreakdown({
            assetId,
            reportedBy: req.user!.id,
            issueDescription: issue,
            photoUrl: photo ?? null,
        });
        return successResponse(res, ticket, "Breakdown ticket raised successfully", 201);
    } catch (err) { next(err); }
};

export const listBreakdowns = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string | undefined;
        const data = await breakdownService.getAllBreakdowns(status);
        return successResponse(res, data, "Breakdown tickets retrieved");
    } catch (err) { next(err); }
};

export const approveBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticketId = Number(req.body.ticketId ?? req.params.id);
        const result = await breakdownService.approveBreakdown(ticketId);
        return successResponse(res, result, "Breakdown ticket approved");
    } catch (err) { next(err); }
};
