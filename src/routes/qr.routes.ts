import { Router } from "express";
import * as assetCtrl from "../controller/asset.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// POST /api/qr — generate QR for an asset
router.post("/", authorize("admin"), assetCtrl.generateQR);

export default router;
