import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { signToken } from "../middleware/auth";

export const authRouter = Router();

// Create a trainer account (for now intentionally open for easier local testing via Postman)
authRouter.post("/register-trainer", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  const normalizedUsername = username?.trim();
  if (!normalizedUsername || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (normalizedUsername.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      passwordHash,
      role: "TRAINER",
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ userId: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

