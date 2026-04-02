import express from "express";
import authRoutes from "./routes/auth.routes";
import assetRoutes from "./routes/asset.routes";
import patientRoutes from "./routes/patient.routes";
import breakdownRoutes from "./routes/breakdown.routes";
import checklistRoutes from "./routes/checklist.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/breakdown", breakdownRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// Health check
app.get("/", (_, res) => {
  res.send("API running...");
});

// Error handler
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});