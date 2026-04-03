import { Router } from "express";
import { getCustomers } from "../controller/customer.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authGuard);

// GET /api/customers — admin gets all users/customers
router.get("/", authorize("admin"), getCustomers);

export default router;
