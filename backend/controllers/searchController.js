import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
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
 *                     $ref: '#/components/schemas/SearchResult'
 */
export const searchAll = async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    const userId = req.user.userId;

    if (!q) {
      return res.status(400).json({ error: "Arama sorgusu gerekli" });
    }

    const results = [];

    // Notlarda arama
    if (!type || type === "notes") {
      const notes = await prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { updatedAt: "desc" },
      });

      results.push(
        ...notes.map((note) => ({
          id: note.id.toString(),
          type: "note",
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
        }))
      );
    }

    // Chat mesajlarında arama
    if (!type || type === "chat") {
      const messages = await prisma.message.findMany({
        where: {
          chat: { userId },
          content: { contains: q, mode: "insensitive" },
        },
        include: { chat: true },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });

      results.push(
        ...messages.map((message) => ({
          id: message.id.toString(),
          type: "chat",
          title: message.chat.title,
          content: message.content,
          createdAt: message.createdAt,
        }))
      );
    }

    // Matematik loglarında arama
    if (!type || type === "math") {
      const mathLogs = await prisma.mathLog.findMany({
        where: {
          userId,
          OR: [
            { question: { contains: q, mode: "insensitive" } },
            { answer: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });

      results.push(
        ...mathLogs.map((log) => ({
          id: log.id.toString(),
          type: "math",
          title: "Matematik Sorusu",
          content: log.question,
          createdAt: log.createdAt,
        }))
      );
    }

    // Çeviri loglarında arama
    if (!type || type === "translate") {
      const translateLogs = await prisma.translateLog.findMany({
        where: {
          userId,
          OR: [
            { sourceText: { contains: q, mode: "insensitive" } },
            { translatedText: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });

      results.push(
        ...translateLogs.map((log) => ({
          id: log.id.toString(),
          type: "translate",
          title: `${log.sourceLanguage} → ${log.targetLanguage}`,
          content: log.sourceText,
          createdAt: log.createdAt,
        }))
      );
    }

    // Metin üretimi loglarında arama
    if (!type || type === "write") {
      const writeLogs = await prisma.writeLog.findMany({
        where: {
          userId,
          OR: [
            { prompt: { contains: q, mode: "insensitive" } },
            { generatedText: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });

      results.push(
        ...writeLogs.map((log) => ({
          id: log.id.toString(),
          type: "write",
          title: "Metin Üretimi",
          content: log.prompt,
          createdAt: log.createdAt,
        }))
      );
    }

    // Görevlerde arama
    if (!type || type === "tasks") {
      const tasks = await prisma.task.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      });

      results.push(
        ...tasks.map((task) => ({
          id: task.id.toString(),
          type: "task",
          title: task.title,
          content: task.description,
          createdAt: task.createdAt,
        }))
      );
    }

    // Sonuçları tarihe göre sırala
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ results: results.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error("Arama hatası:", error);
    res.status(500).json({ error: "Arama sırasında hata oluştu" });
  }
}; 