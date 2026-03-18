import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    const status = err.status || 500;
    const message = err.message || "Internal server ERROR";

    res.status(status).json({
        success: false,
        message,
    });
}