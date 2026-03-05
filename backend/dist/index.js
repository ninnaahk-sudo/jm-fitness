"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("./utils/asyncErrors");
const auth_1 = require("./routes/auth");
const trainer_1 = require("./routes/trainer");
const client_1 = require("./routes/client");
const exercises_1 = require("./routes/exercises");
const app = (0, express_1.default)();
// In development we can allow the Next.js frontend origin (we'll configure it later)
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/auth", auth_1.authRouter);
app.use("/trainer", trainer_1.trainerRouter);
app.use("/client", client_1.clientRouter);
app.use("/exercises", exercises_1.exercisesRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`JM Fitness backend running on port ${PORT}`);
});
