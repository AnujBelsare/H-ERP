import { Router } from "express";
import * as dashCtrl from "../controller/dashboard.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);
router.use(authorize("admin"));

// GET /api/reports?type=breakdown|tasks
router.get("/", dashCtrl.generateReport);

export default router;
