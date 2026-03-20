import { Router } from "express";
import { raiseBreakdown } from "../controller/breakdown.controller";
import { authGuard } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { raiseBreakdownSchema } from "../validations/breakdown.schema";

const router = Router();

router.post(
    "/",
    authGuard,
    validate(raiseBreakdownSchema),
    raiseBreakdown
);

export default router;