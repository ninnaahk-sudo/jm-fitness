"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
// Create a trainer account (for now intentionally open for easier local testing via Postman)
exports.authRouter.post("/register-trainer", async (req, res) => {
    const { username, password } = req.body;
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
    const existing = await db_1.prisma.user.findUnique({
        where: { username: normalizedUsername },
    });
    if (existing) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: {
            username: normalizedUsername,
            passwordHash,
            role: "TRAINER",
        },
    });
    const token = (0, auth_1.signToken)({ userId: user.id, role: user.role });
    return res.status(201).json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    });
});
exports.authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await db_1.prisma.user.findUnique({
        where: { username },
    });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = (0, auth_1.signToken)({ userId: user.id, role: user.role });
    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    });
});
