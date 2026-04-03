import { Router } from "express";
import * as materialCtrl from "../controller/material.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// Technician: add material used in a task
router.post("/", authorize("technician", "admin"), materialCtrl.addMaterial);

// Technician/Admin: get materials for a task
router.get("/task/:taskId", authorize("technician", "admin"), materialCtrl.getMaterials);

export default router;
