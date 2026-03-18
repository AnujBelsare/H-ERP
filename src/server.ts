import express from "express";
import authRoutes from "./routes/auth.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (_, res) => {
  res.send("API running...");
});

// Error handler
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});