import { Router } from "express";
import * as patientController from "../controller/patient.controller";
import { authGuard } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Create (Receptionist only)
router.post("/", authGuard, authorize("receptionist", "admin"), patientController.createPatient);

router.get("/", authGuard, authorize("receptionist", "doctor", "admin"), patientController.getPatients);

router.get("/:id", authGuard, authorize("receptionist", "doctor", "admin"), patientController.getPatientById);

router.patch("/:id", authGuard, authorize("receptionist", "doctor", "admin"), patientController.updatePatient);

router.delete("/:id", authGuard, authorize("admin"), patientController.deletePatient);

router.post(
    "/verify-face", 
    authGuard, 
    authorize("receptionist", "admin"), 
    patientController.verifyFace
);

export default router;