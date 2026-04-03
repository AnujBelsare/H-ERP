import { Router } from "express";
import * as dashCtrl from "../controller/dashboard.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);
router.use(authorize("admin")); // Only admins should see reports/dashboard

router.get("/", dashCtrl.getDashboardData);
router.get("/reports", dashCtrl.generateReport);

export default router;