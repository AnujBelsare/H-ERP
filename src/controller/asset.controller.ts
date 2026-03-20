import { Request, Response, NextFunction } from "express";
import * as assetService from "../services/asset.service";
import { successResponse } from "../utils/response";

export const createAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const asset = await assetService.addAsset(req.body);
        return successResponse(res, asset, "Asset added to inventory", 201);
    } catch (err) { next(err); }
};

export const scanQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.params.code as string;
        const asset = await assetService.getAssetByQR(code);

        return successResponse(res, asset, "Asset details retrieved");
    } catch (err) {
        next(err);
    }
};

export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await assetService.getAssets();
        return successResponse(res, data, "Asset list retrieved");
    } catch (err) {
        next(err);
    }
};