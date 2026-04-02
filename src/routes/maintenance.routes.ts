import { Router } from "express";
import * as maintCtrl from "../controller/maintenance.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// Mobile App APIs
router.post("/breakdown", maintCtrl.reportIssue);
router.get("/tasks", authorize("technician"), maintCtrl.getMyTasks);
router.post("/tasks/:id/complete", authorize("technician"), maintCtrl.completeTask);

// Admin APIs
router.post("/assign", authorize("admin"), maintCtrl.assignTask);

export default router;