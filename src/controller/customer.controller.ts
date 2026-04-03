import { Request, Response, NextFunction } from "express";
import * as customerService from "../services/customer.service";
import { successResponse } from "../utils/response";

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.getAllCustomers();
        return successResponse(res, data, "Customers retrieved");
    } catch (err) { next(err); }
};
