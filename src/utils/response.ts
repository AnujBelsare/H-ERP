import { Response } from "express";

export const successResponse = <T>(
    res: Response,
    data: T,
    message = "Success",
    status = 200,
) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
}

export const errorResponse = (
    res: Response,
    message = "Something went wrong",
    status = 500,
    errors: any = null
) => {
    return res.status(status).json({
        success: false,
        message,
        ...(errors && { errors })
    });
}