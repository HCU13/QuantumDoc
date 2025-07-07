import express from "express";
import newsController from "../controllers/newsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routesr
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);
router.get("/category/:category", newsController.getNewsByCategory);

// Admin routes (protected)
router.post("/", authMiddleware, newsController.createNews);
router.put("/:id", authMiddleware, newsController.updateNews);
router.delete("/:id", authMiddleware, newsController.deleteNews);

export default router;
