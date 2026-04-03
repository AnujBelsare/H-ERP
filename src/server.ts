import express from "express";
import authRoutes from "./routes/auth.routes";
import assetRoutes from "./routes/asset.routes";
import patientRoutes from "./routes/patient.routes";
import breakdownRoutes from "./routes/breakdown.routes";
import checklistRoutes from "./routes/checklist.routes";
import ppmRoutes from "./routes/ppm.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { env } from "./config/env";
import path from "path";

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

// Health check
app.get("/", (_, res) => {
  res.send("API running...");
});

// Error handler
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});