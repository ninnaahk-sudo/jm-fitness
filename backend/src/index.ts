import "dotenv/config";
import express from "express";
import cors from "cors";
import "./utils/asyncErrors";
import { authRouter } from "./routes/auth";
import { trainerRouter } from "./routes/trainer";
import { clientRouter } from "./routes/client";
import { exercisesRouter } from "./routes/exercises";

const app = express();

// In development we can allow the Next.js frontend origin (we'll configure it later)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/trainer", trainerRouter);
app.use("/client", clientRouter);
app.use("/exercises", exercisesRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`JM Fitness backend running on port ${PORT}`);
});

