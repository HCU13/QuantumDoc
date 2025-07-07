import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     SupportTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         status:
 *           type: string
 *           enum: [open, pending, closed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTicketRequest:
 *       type: object
 *       required:
 *         - subject
 *         - message
 *       properties:
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
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
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Destek talebi oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 */
export const createTicket = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message, priority = "medium" } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Konu ve mesaj gerekli" });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        priority,
        status: "open",
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Destek talebi oluşturma hatası:", error);
    res.status(500).json({ error: "Destek talebi oluşturulamadı" });
  }
};

/**
 * @swagger
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
 *                 $ref: '#/components/schemas/SupportTicket'
 */
export const getTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(tickets);
  } catch (error) {
    console.error("Destek talepleri getirme hatası:", error);
    res.status(500).json({ error: "Destek talepleri getirilemedi" });
  }
};

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       404:
 *         description: Talep bulunamadı
 */
export const getTicketById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Destek talebi bulunamadı" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Destek talebi getirme hatası:", error);
    res.status(500).json({ error: "Destek talebi getirilemedi" });
  }
};

/**
 * @swagger
 * /support/ticket/{id}:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       404:
 *         description: Talep bulunamadı
 */
export const updateTicket = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mesaj gerekli" });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Destek talebi bulunamadı" });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: parseInt(id) },
      data: {
        message: ticket.message + "\n\n--- Kullanıcı Yanıtı ---\n" + message,
        status: "pending",
      },
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error("Destek talebi güncelleme hatası:", error);
    res.status(500).json({ error: "Destek talebi güncellenemedi" });
  }
}; 