import { Router } from "express";
import * as siteCtrl from "../controller/site.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { createSiteSchema, mapAssetSchema } from "../validations/site.schema";

const router = Router();

router.use(authGuard);

// Admin APIs for site management
router.get("/", siteCtrl.listSites);
router.post("/", authorize("admin"), validate(createSiteSchema), siteCtrl.addSite);
router.post("/map", authorize("admin"), validate(mapAssetSchema), siteCtrl.assignAssetToSite);

export default router;