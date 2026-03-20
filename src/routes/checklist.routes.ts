import { Router } from "express";
import { submitChecklist } from "../controller/checklist.controller";
import { authGuard } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { submitChecklistSchema } from "../validations/checklist.schema";

const router = Router();

router.post(
    "/",
    authGuard,
    validate(submitChecklistSchema),
    submitChecklist
);

export default router;