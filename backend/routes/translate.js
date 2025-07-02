import express from "express";
import { getTranslateLogs, addTranslateLog } from "../controllers/translateController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Translate
 *   description: AI ile çeviri
 */
/**
 * @swagger
 * /translate:
 *   get:
 *     summary: Kullanıcının çeviri geçmişini getir
 *     tags: [Translate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Çeviri geçmişi
 *   post:
 *     summary: AI ile çeviri yap
 *     tags: [Translate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceText:
 *                 type: string
 *               sourceLang:
 *                 type: string
 *               targetLang:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI çeviri cevabı ve log kaydı
 */

router.use(authMiddleware);
router.get("/", getTranslateLogs);
router.post("/", addTranslateLog);

export default router; 