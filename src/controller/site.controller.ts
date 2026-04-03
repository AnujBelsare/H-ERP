import { Request, Response, NextFunction } from "express";
import * as siteService from "../services/site.service";
import { successResponse } from "../utils/response";

export const addSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const site = await siteService.createSite(req.body);
    return successResponse(res, site, "Site created successfully", 201);
  } catch (err) { next(err); }
};

export const listSites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await siteService.getAllSites();
    return successResponse(res, data, "Sites retrieved");
  } catch (err) { next(err); }
};

export const assignAssetToSite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assetId, siteId } = req.body;
    const result = await siteService.mapAssetToSite(Number(assetId), Number(siteId));
    return successResponse(res, result, "Asset mapped to site successfully");
  } catch (err) { next(err); }
};