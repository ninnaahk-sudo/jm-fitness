"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.clientRouter = (0, express_1.Router)();
// All client routes require authenticated CLIENT
exports.clientRouter.use(auth_1.authMiddleware, (0, auth_1.requireRole)("CLIENT"));
// Get the client's own dashboard: which days exist + videos card
exports.clientRouter.get("/dashboard", async (req, res) => {
    const userId = req.user.userId;
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, createdAt: true },
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const clientProfile = await db_1.prisma.clientProfile.findUnique({
        where: { clientUserId: userId },
    });
    if (!clientProfile) {
        return res.status(404).json({ error: "Client profile not found" });
    }
    // For now we always have 4 days
    const days = [1, 2, 3, 4].map((dayNumber) => ({
        dayNumber,
    }));
    return res.json({
        username: user.username,
        joinedAt: user.createdAt.toISOString(),
        days,
        hasVideos: true,
    });
});
// Get the visible plan for one day (for client view)
exports.clientRouter.get("/days/:dayNumber", async (req, res) => {
    const userId = req.user.userId;
    const dayNumber = Number(req.params.dayNumber);
    if (!dayNumber) {
        return res.status(400).json({ error: "Invalid day" });
    }
    const clientProfile = await db_1.prisma.clientProfile.findUnique({
        where: { clientUserId: userId },
    });
    if (!clientProfile) {
        return res.status(404).json({ error: "Client profile not found" });
    }
    const trainingDay = await db_1.prisma.trainingDay.findFirst({
        where: { clientProfileId: clientProfile.id, dayNumber },
        include: {
            items: {
                include: { exercise: true },
                orderBy: { orderIndex: "asc" },
            },
        },
    });
    if (!trainingDay) {
        return res.json({ dayNumber, dayComment: null, warmup: [], training: [] });
    }
    const warmup = trainingDay.items
        .filter((i) => i.type === "WARMUP")
        .map((i) => ({
        id: i.id,
        exerciseName: i.exercise.name,
        sets: [
            i.set1Kg != null ? `Set 1 - ${i.set1Kg} RIR` : null,
            i.set2Kg != null ? `Set 2 - ${i.set2Kg} RIR` : null,
            i.set3Kg != null ? `Set 3 - ${i.set3Kg} RIR` : null,
            i.set4Kg != null ? `Set 4 - ${i.set4Kg} RIR` : null,
        ].filter(Boolean),
        clientSet1Kg: i.clientSet1Kg,
        clientSet2Kg: i.clientSet2Kg,
        clientSet3Kg: i.clientSet3Kg,
        clientSet4Kg: i.clientSet4Kg,
        orderIndex: i.orderIndex,
    }));
    const training = trainingDay.items
        .filter((i) => i.type === "TRAINING")
        .map((i) => ({
        id: i.id,
        exerciseName: i.exercise.name,
        sets: [
            i.set1Kg != null ? `Set 1 - ${i.set1Kg} RIR` : null,
            i.set2Kg != null ? `Set 2 - ${i.set2Kg} RIR` : null,
            i.set3Kg != null ? `Set 3 - ${i.set3Kg} RIR` : null,
            i.set4Kg != null ? `Set 4 - ${i.set4Kg} RIR` : null,
        ].filter(Boolean),
        clientSet1Kg: i.clientSet1Kg,
        clientSet2Kg: i.clientSet2Kg,
        clientSet3Kg: i.clientSet3Kg,
        clientSet4Kg: i.clientSet4Kg,
        orderIndex: i.orderIndex,
    }));
    return res.json({ dayNumber, dayComment: trainingDay.dayComment, warmup, training });
});
// Client logs their kg for an exercise item
exports.clientRouter.patch("/days/:dayNumber/items/:itemId", async (req, res) => {
    const userId = req.user.userId;
    const dayNumber = Number(req.params.dayNumber);
    const itemId = Number(req.params.itemId);
    if (!dayNumber || !itemId) {
        return res.status(400).json({ error: "Invalid day or item" });
    }
    const { clientSet1Kg, clientSet2Kg, clientSet3Kg, clientSet4Kg } = req.body;
    const clientProfile = await db_1.prisma.clientProfile.findUnique({
        where: { clientUserId: userId },
    });
    if (!clientProfile) {
        return res.status(404).json({ error: "Client profile not found" });
    }
    const trainingDay = await db_1.prisma.trainingDay.findFirst({
        where: { clientProfileId: clientProfile.id, dayNumber },
    });
    if (!trainingDay) {
        return res.status(404).json({ error: "Day not found" });
    }
    const item = await db_1.prisma.trainingItem.findFirst({
        where: { id: itemId, trainingDayId: trainingDay.id },
    });
    if (!item) {
        return res.status(404).json({ error: "Exercise item not found" });
    }
    function toNum(v) {
        if (v === null || v === undefined || v === "")
            return null;
        const n = Number(v);
        // Max 9999 to avoid INT overflow and keep values realistic
        return Number.isFinite(n) && n >= 0 && n <= 9999 ? n : null;
    }
    const s1 = toNum(clientSet1Kg);
    const s2 = toNum(clientSet2Kg);
    const s3 = toNum(clientSet3Kg);
    const s4 = toNum(clientSet4Kg);
    const invalid = [clientSet1Kg, clientSet2Kg, clientSet3Kg, clientSet4Kg].some((v) => {
        if (v == null || v === "")
            return false;
        const n = Number(v);
        return !Number.isFinite(n) || n < 0 || n > 9999;
    });
    if (invalid) {
        return res.status(400).json({ error: "Invalid kg value" });
    }
    await db_1.prisma.trainingItem.update({
        where: { id: itemId },
        data: {
            clientSet1Kg: s1,
            clientSet2Kg: s2,
            clientSet3Kg: s3,
            clientSet4Kg: s4,
        },
    });
    return res.json({ success: true });
});
// List exercises for the client's trainer (for the "VIDEOS" card)
exports.clientRouter.get("/videos/exercises", async (req, res) => {
    const userId = req.user.userId;
    const clientProfile = await db_1.prisma.clientProfile.findUnique({
        where: { clientUserId: userId },
        select: { trainerId: true },
    });
    if (!clientProfile) {
        return res.status(404).json({ error: "Client profile not found" });
    }
    const exercises = await db_1.prisma.exercise.findMany({
        where: { trainerId: clientProfile.trainerId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });
    return res.json({ exercises });
});
// Get videos for a specific exercise
exports.clientRouter.get("/videos/exercises/:exerciseId", async (req, res) => {
    const userId = req.user.userId;
    const exerciseId = Number(req.params.exerciseId);
    if (!exerciseId) {
        return res.status(400).json({ error: "Invalid exercise id" });
    }
    const clientProfile = await db_1.prisma.clientProfile.findUnique({
        where: { clientUserId: userId },
        select: { trainerId: true },
    });
    if (!clientProfile) {
        return res.status(404).json({ error: "Client profile not found" });
    }
    const exercise = await db_1.prisma.exercise.findFirst({
        where: { id: exerciseId, trainerId: clientProfile.trainerId },
        include: {
            videos: {
                orderBy: { id: "asc" },
            },
        },
    });
    if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
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
