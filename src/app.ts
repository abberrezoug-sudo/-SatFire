import express from "express";
import cors from "cors";
import morgan from "morgan";

import firesRoutes from "./routes/fires.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SatFire API",
    time: new Date().toISOString(),
  });
});

// ✅ Enregistrer les routes
app.use("/api/fires", firesRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: `Route non trouvée : ${req.method} ${req.originalUrl}`,
  });
});

export default app;