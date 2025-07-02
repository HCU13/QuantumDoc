import express from "express";
import { getMathLogs, addMathLog, uploadMathImage } from "../controllers/mathController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ dest: "uploads/math/" });

/**
 * @swagger
 * tags:
 *   name: Math
 *   description: Matematik AI modülü
 */
/**
 * @swagger
 * /math:
 *   get:
 *     summary: Kullanıcının matematik geçmişini getir
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matematik geçmişi
 *   post:
 *     summary: AI ile matematik sorusu çöz
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI matematik cevabı ve log kaydı
 */

router.use(authMiddleware);
router.get("/", getMathLogs);
router.post("/", addMathLog);
router.post("/upload-image", upload.single("image"), uploadMathImage);

export default router; 