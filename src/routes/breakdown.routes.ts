import { Router } from "express";
import * as breakdownCtrl from "../controller/breakdown.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validate } from "../middleware/validate";
import { raiseBreakdownSchema } from "../validations/breakdown.schema";

const router = Router();

router.use(authGuard);

// Mobile: raise a breakdown ticket
router.post("/", validate(raiseBreakdownSchema), breakdownCtrl.raiseBreakdown);

// Admin: list all breakdown tickets (optional ?status= filter)
router.get("/", authorize("admin"), breakdownCtrl.listBreakdowns);

// Admin: approve a breakdown ticket
router.post("/approve", authorize("admin"), breakdownCtrl.approveBreakdown);

export default router;
