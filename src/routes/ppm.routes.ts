import { Router } from "express";
import * as ppmCtrl from "../controller/ppm.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { createPPMSchema } from "../validations/ppm.schema";

const router = Router();

router.use(authGuard);

// Admin only: Schedule a recurring maintenance
router.post("/", authorize("admin"), validate(createPPMSchema), ppmCtrl.addPPM);

// Admin & Technician: View schedule for an asset
router.get("/asset/:assetId", authorize("admin", "technician"), ppmCtrl.getPPMByAsset);

export default router;