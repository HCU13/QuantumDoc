import express from "express";
import {
  getChats, addChat,
  createChatRoom, getChatRooms, getChatRoomById, updateChatRoomTitle, deleteChatRoom,
  addMessageToRoom, getMessagesForRoom
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI Chat ve geçmişi
 */
/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Kullanıcının chat geçmişini getir
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat geçmişi
 *   post:
 *     summary: AI ile yeni chat başlat
 *     tags: [Chat]
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
 *         description: AI cevabı ve chat kaydı
 */

router.use(authMiddleware);
router.get("/", getChats);
router.post("/", addChat);

// Chat Room (Oda) API'leri
router.post("/room", createChatRoom);
router.get("/room", getChatRooms);
router.get("/room/:id", getChatRoomById);
router.patch("/room/:id", updateChatRoomTitle);
router.delete("/room/:id", deleteChatRoom);

// Message API'leri
router.post("/room/:id/message", addMessageToRoom);
router.get("/room/:id/messages", getMessagesForRoom);

export default router; 