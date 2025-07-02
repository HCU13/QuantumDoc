import express from "express";
import { getTasks, addTask, updateTask, deleteTask } from "../controllers/tasksController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Görev yönetimi
 */
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Kullanıcının görevlerini getir
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Görev listesi
 *   post:
 *     summary: Yeni görev ekle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Oluşturulan görev
 * /tasks/{id}:
 *   put:
 *     summary: Görev güncelle
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Güncellenen görev
 *   delete:
 *     summary: Görev sil
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Silme başarılı
 */

router.use(authMiddleware);
router.get("/", getTasks);
router.post("/", addTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router; 