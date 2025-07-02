import express from "express";
import { getTokens, addTokens, useTokens, watchVideoForTokens, getTokenHistory } from "../controllers/tokensController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tokens
 *   description: Token işlemleri
 */
/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Kullanıcının mevcut token sayısını getir
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token sayısı
 *   post:
 *     summary: "Token ekle (ör: satın alma, ödül)"
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Güncel token sayısı
 * /tokens/use:
 *   post:
 *     summary: Token harca (AI modülü kullanınca)
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Güncel token sayısı
 * /tokens/watch-video:
 *   post:
 *     summary: Video izleyerek token kazan
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Güncel token sayısı ve video hakkı
 * /tokens/history:
 *   get:
 *     summary: Token hareket geçmişini getir
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token geçmişi
 */

router.use(authMiddleware);
router.get("/", getTokens);
router.post("/", addTokens);
router.post("/use", useTokens);
router.post("/watch-video", watchVideoForTokens);
router.get("/history", getTokenHistory);

export default router; 