import { Request, Response, NextFunction } from "express";
import * as materialService from "../services/material.service";
import { successResponse } from "../utils/response";

export const addMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId, material, qty } = req.body;
        const entry = await materialService.addMaterial({
            taskId: Number(taskId),
            materialName: material,
            quantity: Number(qty),
        });
        return successResponse(res, entry, "Material added successfully", 201);
    } catch (err) { next(err); }
};

export const getMaterials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = Number(req.params.taskId);
        const data = await materialService.getMaterialsByTask(taskId);
        return successResponse(res, data, "Materials retrieved");
    } catch (err) { next(err); }
};
