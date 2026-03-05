"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exercisesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.exercisesRouter = (0, express_1.Router)();
// All of these routes are for trainers managing the exercise catalog and videos.
exports.exercisesRouter.use(auth_1.authMiddleware, (0, auth_1.requireRole)("TRAINER"));
// List all exercises
exports.exercisesRouter.get("/", async (req, res) => {
    const trainerId = req.user.userId;
    const exercises = await db_1.prisma.exercise.findMany({
        where: { trainerId },
        orderBy: { name: "asc" },
    });
    res.json(exercises);
});
// Create a new exercise
exports.exercisesRouter.post("/", async (req, res) => {
    const trainerId = req.user.userId;
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    const existing = await db_1.prisma.exercise.findFirst({ where: { trainerId, name } });
    if (existing) {
        return res.status(400).json({ error: "Exercise with this name already exists" });
    }
    const exercise = await db_1.prisma.exercise.create({
        data: { trainerId, name, description: description || null },
    });
    res.status(201).json(exercise);
});
// Add a YouTube video to an exercise
exports.exercisesRouter.post("/:exerciseId/videos", async (req, res) => {
    const trainerId = req.user.userId;
    const exerciseId = Number(req.params.exerciseId);
    const { title, youtubeId } = req.body;
    if (!exerciseId || !title || !youtubeId) {
        return res.status(400).json({ error: "exerciseId, title and youtubeId are required" });
    }
    const exercise = await db_1.prisma.exercise.findFirst({
        where: { id: exerciseId, trainerId },
    });
    if (!exercise) {
        return res.status(404).json({ error: "Exercise not found for this trainer" });
    }
    const video = await db_1.prisma.exerciseVideo.create({
        data: {
            exerciseId,
            title,
            youtubeId,
        },
    });
    res.status(201).json(video);
});
// Get videos for a specific trainer exercise
exports.exercisesRouter.get("/:exerciseId/videos", async (req, res) => {
    const trainerId = req.user.userId;
    const exerciseId = Number(req.params.exerciseId);
    if (!exerciseId) {
        return res.status(400).json({ error: "Invalid exercise id" });
    }
    const exercise = await db_1.prisma.exercise.findFirst({
        where: { id: exerciseId, trainerId },
        include: {
            videos: {
                orderBy: { id: "asc" },
            },
        },
    });
    if (!exercise) {
        return res.status(404).json({ error: "Exercise not found for this trainer" });
    }
    return res.json({
        id: exercise.id,
        name: exercise.name,
        videos: exercise.videos.map((v) => ({
            id: v.id,
            title: v.title,
            youtubeId: v.youtubeId,
        })),
    });
});
