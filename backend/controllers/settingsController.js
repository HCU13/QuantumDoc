import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *         theme:
 *           type: string
 *         notifications:
 *           type: boolean
 *         autoSave:
 *           type: boolean
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
 *               $ref: '#/components/schemas/UserSettings'
 */
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        language: true,
        theme: true,
        notifications: true,
        autoSave: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (error) {
    console.error("Ayarlar getirilirken hata:", error);
    res.status(500).json({ error: "Ayarlar getirilemedi" });
  }
};

/**
 * @swagger
 * /settings:
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
 *             $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: Ayarlar güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 */
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language, theme, notifications, autoSave } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        language,
        theme,
        notifications,
        autoSave,
      },
      select: {
        language: true,
        theme: true,
        notifications: true,
        autoSave: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Ayarlar güncellenirken hata:", error);
    res.status(500).json({ error: "Ayarlar güncellenemedi" });
  }
};

/**
 * @swagger
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
 */
export const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({ error: "Dil parametresi gerekli" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { language },
      select: { language: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Dil ayarı güncellenirken hata:", error);
    res.status(500).json({ error: "Dil ayarı güncellenemedi" });
  }
};

/**
 * @swagger
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
export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: "Tema parametresi gerekli" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { theme },
      select: { theme: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Tema ayarı güncellenirken hata:", error);
    res.status(500).json({ error: "Tema ayarı güncellenemedi" });
  }
}; 