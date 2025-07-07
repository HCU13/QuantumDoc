import express from "express";
import { searchAll } from "../controllers/searchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global arama işlemleri
 */
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Tüm modüllerde arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Arama sorgusu
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: "Arama tipi (notes, chat, math, translate, write, tasks)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Sonuç sayısı (varsayılan: 20)"
 *     responses:
 *       200:
 *         description: Arama sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */

router.use(authMiddleware);
router.get("/", searchAll);

export default router; 