import { Router } from "express";
import { prisma } from "../db";
import { authMiddleware, requireRole } from "../middleware/auth";

export const exercisesRouter = Router();

// All of these routes are for trainers managing the exercise catalog and videos.
exercisesRouter.use(authMiddleware, requireRole("TRAINER"));

// List all exercises
exercisesRouter.get("/", async (req, res) => {
  const trainerId = req.user!.userId;
  const exercises = await prisma.exercise.findMany({
    where: { trainerId },
    orderBy: { name: "asc" },
  });
  res.json(exercises);
});

// Create a new exercise
exercisesRouter.post("/", async (req, res) => {
  const trainerId = req.user!.userId;
  const { name, description } = req.body as {
    name?: string;
    description?: string;
  };

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const existing = await prisma.exercise.findFirst({ where: { trainerId, name } });
  if (existing) {
    return res.status(400).json({ error: "Exercise with this name already exists" });
  }

  const exercise = await prisma.exercise.create({
    data: { trainerId, name, description: description || null },
  });

  res.status(201).json(exercise);
});

// Add a YouTube video to an exercise
exercisesRouter.post("/:exerciseId/videos", async (req, res) => {
  const trainerId = req.user!.userId;
  const exerciseId = Number(req.params.exerciseId);
  const { title, youtubeId } = req.body as {
    title?: string;
    youtubeId?: string;
  };

  if (!exerciseId || !title || !youtubeId) {
    return res.status(400).json({ error: "exerciseId, title and youtubeId are required" });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, trainerId },
  });
  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found for this trainer" });
  }

  const video = await prisma.exerciseVideo.create({
    data: {
      exerciseId,
      title,
      youtubeId,
    },
  });

  res.status(201).json(video);
});

// Get videos for a specific trainer exercise
exercisesRouter.get("/:exerciseId/videos", async (req, res) => {
  const trainerId = req.user!.userId;
  const exerciseId = Number(req.params.exerciseId);

  if (!exerciseId) {
    return res.status(400).json({ error: "Invalid exercise id" });
  }

  const exercise = await prisma.exercise.findFirst({
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

