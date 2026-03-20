import { Router } from "express";
import * as assetCtrl from "../controller/asset.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { createAssetSchema } from "../validations/asset.schema";

const router = Router();

router.get("/qr/:code", authGuard, assetCtrl.scanQR);

router.get("/", authGuard, authorize("admin", "technician"), assetCtrl.listAssets);
router.post("/", authGuard, authorize("admin"), validate(createAssetSchema), assetCtrl.createAsset);

export default router;