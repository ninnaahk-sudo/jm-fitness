import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { authMiddleware, requireRole } from "../middleware/auth";

export const trainerRouter = Router();

// All trainer routes require authenticated TRAINER
trainerRouter.use(authMiddleware, requireRole("TRAINER"));

// Get list of clients for the current trainer
trainerRouter.get("/clients", async (req, res) => {
  const trainerId = req.user!.userId;

  const clients = await prisma.clientProfile.findMany({
    where: { trainerId },
    include: {
      clientUser: {
        select: { id: true, username: true },
      },
    },
  });

  return res.json(
    clients.map((c) => ({
      id: c.id,
      clientUserId: c.clientUserId,
      username: c.clientUser.username,
    }))
  );
});

// Create a new client (trainer chooses username + password)
trainerRouter.post("/clients", async (req, res) => {
  const trainerId = req.user!.userId;
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const clientUser = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: "CLIENT",
    },
  });

  const clientProfile = await prisma.clientProfile.create({
    data: {
      clientUserId: clientUser.id,
      trainerId,
    },
  });

  // Also ensure 4 TrainingDay records exist for this client (Day 1-4)
  await prisma.trainingDay.createMany({
    data: [1, 2, 3, 4].map((dayNumber) => ({
      clientProfileId: clientProfile.id,
      dayNumber,
    })),
  });

  return res.status(201).json({
    id: clientProfile.id,
    clientUserId: clientUser.id,
    username: clientUser.username,
  });
});

// Get training plan for a specific client + day (for editing)
trainerRouter.get("/clients/:clientId/days/:dayNumber", async (req, res) => {
  const trainerId = req.user!.userId;
  const clientId = Number(req.params.clientId);
  const dayNumber = Number(req.params.dayNumber);

  if (!clientId || !dayNumber) {
    return res.status(400).json({ error: "Invalid client or day" });
  }

  const clientProfile = await prisma.clientProfile.findFirst({
    where: { id: clientId, trainerId },
  });

  if (!clientProfile) {
    return res.status(404).json({ error: "Client not found" });
  }

  const trainingDay = await prisma.trainingDay.findFirst({
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
      exerciseId: i.exerciseId,
      exerciseName: i.exercise.name,
      set1Kg: i.set1Kg,
      set2Kg: i.set2Kg,
      set3Kg: i.set3Kg,
      set4Kg: i.set4Kg,
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
      exerciseId: i.exerciseId,
      exerciseName: i.exercise.name,
      set1Kg: i.set1Kg,
      set2Kg: i.set2Kg,
      set3Kg: i.set3Kg,
      set4Kg: i.set4Kg,
      clientSet1Kg: i.clientSet1Kg,
      clientSet2Kg: i.clientSet2Kg,
      clientSet3Kg: i.clientSet3Kg,
      clientSet4Kg: i.clientSet4Kg,
      orderIndex: i.orderIndex,
    }));

  return res.json({ dayNumber, dayComment: trainingDay.dayComment, warmup, training });
});

// Update training plan for a specific client + day
trainerRouter.put("/clients/:clientId/days/:dayNumber", async (req, res) => {
  const trainerId = req.user!.userId;
  const clientId = Number(req.params.clientId);
  const dayNumber = Number(req.params.dayNumber);

  const body = req.body as {
    dayComment?: string | null;
    warmup: {
      exerciseId: number;
      set1Kg?: number | null;
      set2Kg?: number | null;
      set3Kg?: number | null;
      set4Kg?: number | null;
    }[];
    training: {
      exerciseId: number;
      set1Kg?: number | null;
      set2Kg?: number | null;
      set3Kg?: number | null;
      set4Kg?: number | null;
    }[];
  };

  if (!clientId || !dayNumber) {
    return res.status(400).json({ error: "Invalid client or day" });
  }

  const clientProfile = await prisma.clientProfile.findFirst({
    where: { id: clientId, trainerId },
  });

  if (!clientProfile) {
    return res.status(404).json({ error: "Client not found" });
  }

  const payloadExerciseIds = [
    ...(body.warmup || []).map((w) => Number(w.exerciseId)),
    ...(body.training || []).map((t) => Number(t.exerciseId)),
  ].filter((id) => Number.isFinite(id) && id > 0);

  if (payloadExerciseIds.length > 0) {
    const allowedExercises = await prisma.exercise.findMany({
      where: {
        trainerId,
        id: { in: payloadExerciseIds },
      },
      select: { id: true },
    });
    const allowedIds = new Set(allowedExercises.map((e) => e.id));
    const hasForeignExercise = payloadExerciseIds.some((id) => !allowedIds.has(id));
    if (hasForeignExercise) {
      return res.status(400).json({
        error: "One or more exercises do not belong to this trainer",
      });
    }
  }

  const trainingDay = await prisma.trainingDay.upsert({
    where: {
      clientProfileId_dayNumber: {
        clientProfileId: clientProfile.id,
        dayNumber,
      },
    },
    create: {
      clientProfileId: clientProfile.id,
      dayNumber,
      dayComment: body.dayComment ?? null,
    },
    update: {
      dayComment: body.dayComment ?? null,
    },
  });

  // Preserve client kg when trainer updates: match old items by (type, orderIndex, exerciseId)
  const existingItems = await prisma.trainingItem.findMany({
    where: { trainingDayId: trainingDay.id },
    select: {
      exerciseId: true,
      type: true,
      orderIndex: true,
      clientSet1Kg: true,
      clientSet2Kg: true,
      clientSet3Kg: true,
      clientSet4Kg: true,
    },
  });
  const clientKgMap = new Map<
    string,
    { clientSet1Kg: number | null; clientSet2Kg: number | null; clientSet3Kg: number | null; clientSet4Kg: number | null }
  >();
  for (const i of existingItems) {
    clientKgMap.set(`${i.type}-${i.orderIndex}-${i.exerciseId}`, {
      clientSet1Kg: i.clientSet1Kg ?? null,
      clientSet2Kg: i.clientSet2Kg ?? null,
      clientSet3Kg: i.clientSet3Kg ?? null,
      clientSet4Kg: i.clientSet4Kg ?? null,
    });
  }

  await prisma.trainingItem.deleteMany({
    where: { trainingDayId: trainingDay.id },
  });

  const getClientKg = (type: string, index: number, exerciseId: number) =>
    clientKgMap.get(`${type}-${index}-${exerciseId}`) ?? {
      clientSet1Kg: null,
      clientSet2Kg: null,
      clientSet3Kg: null,
      clientSet4Kg: null,
    };

  const warmupData = (body.warmup || []).map((w, index) => {
    const c = getClientKg("WARMUP", index, w.exerciseId);
    return {
      trainingDayId: trainingDay.id,
      exerciseId: w.exerciseId,
      type: "WARMUP",
      orderIndex: index,
      set1Kg: w.set1Kg ?? null,
      set2Kg: w.set2Kg ?? null,
      set3Kg: w.set3Kg ?? null,
      set4Kg: w.set4Kg ?? null,
      clientSet1Kg: c.clientSet1Kg,
      clientSet2Kg: c.clientSet2Kg,
      clientSet3Kg: c.clientSet3Kg,
      clientSet4Kg: c.clientSet4Kg,
    };
  });

  const trainingData = (body.training || []).map((t, index) => {
    const c = getClientKg("TRAINING", index, t.exerciseId);
    return {
      trainingDayId: trainingDay.id,
      exerciseId: t.exerciseId,
      type: "TRAINING",
      orderIndex: index,
      set1Kg: t.set1Kg ?? null,
      set2Kg: t.set2Kg ?? null,
      set3Kg: t.set3Kg ?? null,
      set4Kg: t.set4Kg ?? null,
      clientSet1Kg: c.clientSet1Kg,
      clientSet2Kg: c.clientSet2Kg,
      clientSet3Kg: c.clientSet3Kg,
      clientSet4Kg: c.clientSet4Kg,
    };
  });

  await prisma.trainingItem.createMany({
    data: [...warmupData, ...trainingData],
  });

  return res.json({ success: true });
});

