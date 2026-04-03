import { Router } from "express";
import * as notifCtrl from "../controller/notification.controller";
import { authGuard } from "../middleware/auth.middleware";

const router = Router();

router.use(authGuard);

// Mobile & Windows: Get all alerts for logged in user
router.get("/", notifCtrl.getMyNotifications);

// Mark a specific alert as read
router.patch("/:id/read", notifCtrl.readNotification);

export default router;
