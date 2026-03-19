import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} Error:`, err);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    return errorResponse(res, message, status);
};