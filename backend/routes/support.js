import express from "express";
import { createTicket, getTickets, updateTicket, getTicketById } from "../controllers/supportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Yardım ve destek sistemi
 */
/**
 * @swagger
 * /support/ticket:
 *   post:
 *     summary: Yeni destek talebi oluştur
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 description: "Talep konusu"
 *               message:
 *                 type: string
 *                 description: "Detaylı mesaj"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: "Öncelik seviyesi"
 *     responses:
 *       201:
 *         description: Destek talebi oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 subject:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 * /support/tickets:
 *   get:
 *     summary: Kullanıcının destek taleplerini getir
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: "Talep durumu (open, closed, pending)"
 *     responses:
 *       200:
 *         description: Destek talepleri listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   subject:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 * /support/ticket/{id}:
 *   get:
 *     summary: Belirli bir destek talebini getir
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Talep ID"
 *     responses:
 *       200:
 *         description: Destek talebi detayları
 *       404:
 *         description: Talep bulunamadı
 *   put:
 *     summary: Destek talebini güncelle (kullanıcı yanıtı)
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Talep ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: "Ek mesaj"
 *     responses:
 *       200:
 *         description: Talep güncellendi
 *       404:
 *         description: Talep bulunamadı
 */

router.use(authMiddleware);
router.post("/ticket", createTicket);
router.get("/tickets", getTickets);
router.get("/ticket/:id", getTicketById);
router.put("/ticket/:id", updateTicket);

export default router; 