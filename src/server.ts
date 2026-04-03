import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes";
import assetRoutes from "./routes/asset.routes";
import patientRoutes from "./routes/patient.routes";
import breakdownRoutes from "./routes/breakdown.routes";
import checklistRoutes from "./routes/checklist.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import ppmRoutes from "./routes/ppm.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import siteRoutes from "./routes/site.routes";
import notificationRoutes from "./routes/notification.routes";
import materialRoutes from "./routes/material.routes";
import tasksRoutes from "./routes/tasks.routes";
import assignRoutes from "./routes/assign.routes";
import reportsRoutes from "./routes/reports.routes";
import assetMappingRoutes from "./routes/asset-mapping.routes";
import qrRoutes from "./routes/qr.routes";
import customersRoutes from "./routes/customers.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { env } from "./config/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/breakdown", breakdownRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/ppm", ppmRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/assign", assignRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/asset-mapping", assetMappingRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/customers", customersRoutes);

// Health check
app.get("/", (_, res) => { res.send("API running..."); });

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
