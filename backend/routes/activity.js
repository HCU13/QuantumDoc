import express from "express";
import { getAllActivities, getRecentActivities } from "../controllers/activityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Son aktiviteler ve geçmiş
 */
/**
 * @swagger
 * /activity:
 *   get:
 *     summary: Kullanıcının tüm aktivitelerini getir (tüm modüllerden birleşik)
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: "Aktivite tipi (math, chat, write, note, translate, task, vs.)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Kaç adet aktivite döndürülecek (varsayılan: 20)"
 *     responses:
 *       200:
 *         description: Son aktiviteler listesi
 */
/**
 * @swagger
 * /activity/recent:
 *   get:
 *     summary: Kullanıcının yaptığı son 4 aktiviteyi getir (modül fark etmeksizin)
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Son 4 aktivite
 */

router.use(authMiddleware);
router.get("/", getAllActivities);
router.get("/recent", getRecentActivities);

export default router; 