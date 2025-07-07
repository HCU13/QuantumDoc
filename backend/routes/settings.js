import express from "express";
import { getSettings, updateSettings, updateLanguage, updateTheme } from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Kullanıcı ayarları ve tercihleri
 */
/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Kullanıcı ayarlarını getir
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı ayarları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 language:
 *                   type: string
 *                 theme:
 *                   type: string
 *                 notifications:
 *                   type: boolean
 *                 autoSave:
 *                   type: boolean
 *   put:
 *     summary: Kullanıcı ayarlarını güncelle
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               theme:
 *                 type: string
 *               notifications:
 *                 type: boolean
 *               autoSave:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ayarlar güncellendi
 * /settings/language:
 *   post:
 *     summary: Dil ayarını güncelle
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dil ayarı güncellendi
 * /settings/theme:
 *   post:
 *     summary: Tema ayarını güncelle
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tema ayarı güncellendi
 */

router.use(authMiddleware);
router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/language", updateLanguage);
router.post("/theme", updateTheme);

export default router; 