import express, { Router } from "express";
import authRoutes from "./auth";

const router: Router = express.Router();

// router.use("/auth", authRoutes);
// router.use("/image", imageRoutes);
router.use("/auth", authRoutes);

export default router;
