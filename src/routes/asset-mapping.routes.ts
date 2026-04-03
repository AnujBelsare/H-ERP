import { Router } from "express";
import * as siteCtrl from "../controller/site.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { mapAssetSchema } from "../validations/site.schema";

const router = Router();

router.use(authGuard);

// POST /api/asset-mapping — map an asset to a site
router.post("/", authorize("admin"), validate(mapAssetSchema), siteCtrl.assignAssetToSite);

export default router;
