import { Router } from "express";
import { login, signup } from "../controller/auth.controller";
import { loginSchema, signupSchema } from "../validations/auth.schema";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/signup", validate(signupSchema), signup);

export default router;