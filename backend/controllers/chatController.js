import { PrismaClient } from "@prisma/client";
import { askClaude } from "../utils/claude.js";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         userId:
 *           type: integer
 *         lastMessage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         chatId:
 *           type: integer
 *         sender:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateChatRoomRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *     AddMessageRequest:
 *       type: object
 *       required:
 *         - sender
 *         - content
 *       properties:
 *         sender:
 *           type: string
 *         content:
 *           type: string
 *     ChatRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: string
 */

/**
 * @swagger
 * /chat/rooms:
 *   post:
 *     summary: Yeni chat odası oluştur
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatRoomRequest'
 *     responses:
 *       200:
 *         description: Chat odası başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatRoom'
 *       400:
 *         description: Başlık gerekli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// --- Chat Room (Oda) API'leri ---
export const createChatRoom = async (req, res) => {
  const { title } = req.body;
  const userId = req.user.userId;
  if (!title || !title.trim()) return res.status(400).json({ error: "Başlık gerekli" });
  const chat = await prisma.chat.create({
    data: { title: title.trim(), userId },
  });
  res.json(chat);
};

/**
 * @swagger
 * /chat/rooms:
 *   get:
 *     summary: Kullanıcının chat odalarını getir
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat odaları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatRoom'
 */
export const getChatRooms = async (req, res) => {
  const userId = req.user.userId;
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      lastMessage: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  res.json(chats);
};

export const getChatRoomById = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const chat = await prisma.chat.findFirst({ where: { id: Number(id), userId } });
  if (!chat) return res.status(404).json({ error: "Oda bulunamadı" });
  res.json(chat);
};

export const updateChatRoomTitle = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "Başlık gerekli" });
  const chat = await prisma.chat.updateMany({
    where: { id: Number(id), userId },
    data: { title: title.trim() },
  });
  if (chat.count === 0) return res.status(404).json({ error: "Oda bulunamadı" });
  res.json({ success: true });
};

export const deleteChatRoom = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  // Mesajları da sil
  await prisma.message.deleteMany({ where: { chatId: Number(id) } });
  const chat = await prisma.chat.deleteMany({ where: { id: Number(id), userId } });
  if (chat.count === 0) return res.status(404).json({ error: "Oda bulunamadı" });
  res.json({ success: true });
};

// --- Message API'leri ---
/**
 * @swagger
 * /chat/rooms/{id}/messages:
 *   post:
 *     summary: Chat odasına mesaj ekle
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat odası ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMessageRequest'
 *     responses:
 *       200:
 *         description: Mesaj başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Mesaj ve gönderen gerekli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Oda bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const addMessageToRoom = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { sender, content } = req.body;
  if (!content || !sender) return res.status(400).json({ error: "Mesaj ve gönderen gerekli" });
  // Oda var mı ve kullanıcıya mı ait?
  const chat = await prisma.chat.findFirst({ where: { id: Number(id), userId } });
  if (!chat) return res.status(404).json({ error: "Oda bulunamadı" });
  const message = await prisma.message.create({
    data: { chatId: Number(id), sender, content },
  });
  // Odanın son mesajını güncelle
  await prisma.chat.update({ where: { id: Number(id) }, data: { lastMessage: content, updatedAt: new Date() } });
  res.json(message);
};

/**
 * @swagger
 * /chat/rooms/{id}/messages:
 *   get:
 *     summary: Chat odasındaki mesajları getir
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chat odası ID
 *     responses:
 *       200:
 *         description: Mesajlar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: Oda bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const getMessagesForRoom = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  // Oda var mı ve kullanıcıya mı ait?
  const chat = await prisma.chat.findFirst({ where: { id: Number(id), userId } });
  if (!chat) return res.status(404).json({ error: "Oda bulunamadı" });
  const messages = await prisma.message.findMany({
    where: { chatId: Number(id) },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
};

// --- (Mevcut) Tek Mesajlık Chat API'leri ---
// Bunlar eski tek mesajlık chat için, istenirse kaldırılabilir
const CHAT_TOKEN_COST = 1;

export const getChats = async (req, res) => {
  const chats = await prisma.chat.findMany({ where: { userId: req.user.userId } });
  res.json(chats);
};

export const addChat = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.userId;
  // Kullanıcı token kontrolü
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.tokens < CHAT_TOKEN_COST) {
    return res.status(400).json({ error: "Yetersiz token" });
  }
  // Claude AI'dan yanıt al
  let responseText = "";
  try {
    responseText = await askClaude(prompt);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  // Chat kaydını oluştur
  const chat = await prisma.chat.create({
    data: { prompt, response: responseText, userId }
  });
  // Kullanıcıdan token düş
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: CHAT_TOKEN_COST } }
  });
  // TokenLog kaydı
  await prisma.tokenLog.create({
    data: {
      userId,
      amount: -CHAT_TOKEN_COST,
      type: "use",
      description: "Chat AI mesajı için token harcandı"
    }
  });
  res.json(chat);
}; 