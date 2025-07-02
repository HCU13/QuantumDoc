import express from "express";
import { getSubscription, upgradeSubscription, cancelSubscription, getSubscriptionHistory } from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Abonelik işlemleri
 */
/**
 * @swagger
 * /subscription:
 *   get:
 *     summary: Kullanıcının mevcut abonelik planını getir
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abonelik bilgisi
 *   post:
 *     summary: Abonelik planını yükselt veya değiştir
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncel abonelik bilgisi
 * /subscription/cancel:
 *   post:
 *     summary: Aboneliği iptal et
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abonelik iptal edildi
 * /subscription/history:
 *   get:
 *     summary: Abonelik geçmişini getir
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abonelik geçmişi
 */

router.use(authMiddleware);
router.get("/", getSubscription);
router.post("/", upgradeSubscription);
router.post("/cancel", cancelSubscription);
router.get("/history", getSubscriptionHistory);

export default router; 