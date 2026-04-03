import { Router } from "express";
import * as maintCtrl from "../controller/maintenance.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// GET /api/tasks — technician gets their task list
router.get("/", authorize("technician"), maintCtrl.getMyTasks);

// POST /api/tasks/complete — technician completes a task
router.post("/complete", authorize("technician"), maintCtrl.completeTaskById);

export default router;
