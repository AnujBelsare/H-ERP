import { Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const authorize = (...allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                "Forbidden: You do not have permission to perform this action",
                403
            );
        }
        next();
    };
};