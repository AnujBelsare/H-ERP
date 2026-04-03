import { Router } from "express";
import * as maintCtrl from "../controller/maintenance.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// POST /api/assign — admin assigns technician to a breakdown ticket
router.post("/", authorize("admin"), maintCtrl.assignTask);

export default router;
