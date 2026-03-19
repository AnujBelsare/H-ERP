import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { errorResponse } from "../utils/response";

interface TokenPlayload {
    id: string,
    role: string
}

export const authGuard = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) throw { status: 401, message: "Access denied. No token provided." };

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPlayload;

        req.user = {
            id: decoded.id,
            role: decoded.role,
        } as any;

        next();
    }
    catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return errorResponse(res, "Session expired. Please login again.", 401);
        }
        if (err.name === "JsonWebTokenError") {
            return errorResponse(res, "Invalid token.", 401);
        }
        next(err);
    }
}