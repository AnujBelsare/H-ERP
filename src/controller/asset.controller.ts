import { Request, Response, NextFunction } from "express";
import * as assetService from "../services/asset.service";
import { successResponse } from "../utils/response";
import { CreateAssetInput, UpdateAssetInput } from "../validations/asset.schema";

export const createAsset = async (req: Request<{}, {}, CreateAssetInput>, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.addAsset(req.body);
    return successResponse(res, asset, "Asset added successfully", 201);
  } catch (err) { next(err); }
};

export const updateAsset = async (req: Request<{ id: string }, {}, UpdateAssetInput>, res: Response, next: NextFunction) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    return successResponse(res, asset, "Asset updated successfully");
  } catch (err) { next(err); }
};

export const deleteAsset = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await assetService.deleteAsset(req.params.id);
    return successResponse(res, null, "Asset deleted successfully");
  } catch (err) { next(err); }
};

export const listAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await assetService.getAssets();
    return successResponse(res, data, "Asset list retrieved");
  } catch (err) { next(err); }
};

export const scanQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = String(req.params.code);
    const asset = await assetService.getAssetByQR(code);
    return successResponse(res, asset, "Asset details retrieved");
  } catch (err) { next(err); }
};