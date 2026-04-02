import { Router } from "express";
import * as assetCtrl from "../controller/asset.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { createAssetSchema, updateAssetSchema } from "../validations/asset.schema";

const router = Router();

router.use(authGuard);

// Mobile & Admin Shared
router.get("/qr/:code", assetCtrl.scanQR);
router.get("/", authorize("admin", "technician"), assetCtrl.listAssets);

// Admin Only
router.post("/", authorize("admin"), validate(createAssetSchema), assetCtrl.createAsset);
router.put("/:id", authorize("admin"), validate(updateAssetSchema), assetCtrl.updateAsset);
router.delete("/:id", authorize("admin"), assetCtrl.deleteAsset);

export default router;