import express from "express";
import { getWriteLogs, addWriteLog } from "../controllers/writeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Write
 *   description: AI ile yazı üretimi
 */
/**
 * @swagger
 * /write:
 *   get:
 *     summary: Kullanıcının yazı geçmişini getir
 *     tags: [Write]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Yazı geçmişi
 *   post:
 *     summary: AI ile yazı üret
 *     tags: [Write]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI yazı cevabı ve log kaydı
 */

router.use(authMiddleware);
router.get("/", getWriteLogs);
router.post("/", addWriteLog);

export default router; 