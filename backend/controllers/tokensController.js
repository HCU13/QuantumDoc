import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenResponse:
 *       type: object
 *       properties:
 *         tokens:
 *           type: integer
 *           description: Kullanıcının token sayısı
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TokenLog'
 *     TokenLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         amount:
 *           type: integer
 *         type:
 *           type: string
 *           description: Token işlem türü (add, use, reward, purchase)
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AddTokensRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: Eklenecek token miktarı
 *         type:
 *           type: string
 *           description: Token ekleme türü (reward, purchase, bonus)
 *         description:
 *           type: string
 *           description: İşlem açıklaması
 *     UseTokensRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: Kullanılacak token miktarı
 *     VideoWatchResponse:
 *       type: object
 *       properties:
 *         tokens:
 *           type: integer
 *           description: Güncel token sayısı
 *         watchedVideosToday:
 *           type: integer
 *           description: Bugün izlenen video sayısı
 *         canWatchMore:
 *           type: boolean
 *           description: Daha fazla video izlenebilir mi
 *     DailyRewardResponse:
 *       type: object
 *       properties:
 *         tokens:
 *           type: integer
 *           description: Güncel token sayısı
 *         rewardAmount:
 *           type: integer
 *           description: Kazanılan token miktarı
 *         message:
 *           type: string
 *           description: Başarı mesajı
 *     PurchaseTokensRequest:
 *       type: object
 *       required:
 *         - packageId
 *         - paymentMethod
 *       properties:
 *         packageId:
 *           type: string
 *           description: Token paketi ID'si
 *         paymentMethod:
 *           type: string
 *           description: Ödeme yöntemi
 *         amount:
 *           type: integer
 *           description: Satın alınacak token miktarı
 */

/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Kullanıcının token sayısını ve geçmişini getir
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getTokens = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      include: {
        tokenLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      tokens: user.tokens,
      history: user.tokenLogs
    });
  } catch (error) {
    console.error("Get tokens error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/add:
 *   post:
 *     summary: Token ekle
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTokensRequest'
 *     responses:
 *       200:
 *         description: Token başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Geçersiz miktar
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const addTokens = async (req, res) => {
  try {
    const { amount, type = 'reward', description = '' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Geçersiz miktar" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        tokens: { increment: amount }
      },
    });

    // Token log kaydı
    await prisma.tokenLog.create({
      data: {
        userId: req.user.userId,
        amount,
        type,
        description
      }
    });

    res.json({ 
      tokens: user.tokens,
      log: { amount, type, description, createdAt: new Date() }
    });
  } catch (error) {
    console.error("Add tokens error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/use:
 *   post:
 *     summary: Token kullan
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UseTokensRequest'
 *     responses:
 *       200:
 *         description: Token başarıyla kullanıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Geçersiz miktar veya yetersiz token
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const useTokens = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Geçersiz miktar" });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId } 
    });

    if (user.tokens < amount) {
      return res.status(400).json({ error: "Yetersiz token" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { tokens: { decrement: amount } },
    });

    // Token log kaydı
    await prisma.tokenLog.create({
      data: {
        userId: req.user.userId,
        amount: -amount,
        type: 'use',
        description: 'Token kullanıldı'
      }
    });

    res.json({ 
      tokens: updated.tokens,
      log: { amount: -amount, type: 'use', description: 'Token kullanıldı', createdAt: new Date() }
    });
  } catch (error) {
    console.error("Use tokens error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/watch-video:
 *   post:
 *     summary: Video izleyerek token kazan
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Video izleme başarılı, token eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoWatchResponse'
 *       400:
 *         description: Günlük video izleme hakkı doldu
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const watchVideoForTokens = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const now = new Date();
    
    const isSameDay = user.lastVideoWatchDate &&
      now.getFullYear() === user.lastVideoWatchDate.getFullYear() &&
      now.getMonth() === user.lastVideoWatchDate.getMonth() &&
      now.getDate() === user.lastVideoWatchDate.getDate();
    
    let watchedVideosToday = isSameDay ? user.watchedVideosToday : 0;
    
    if (watchedVideosToday >= 3) {
      return res.status(400).json({ error: "Günlük video izleme hakkı doldu" });
    }
    
    watchedVideosToday++;
    
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        tokens: { increment: 2 },
        watchedVideosToday,
        lastVideoWatchDate: now,
      },
    });

    // Token log kaydı
    await prisma.tokenLog.create({
      data: {
        userId: req.user.userId,
        amount: 2,
        type: 'reward',
        description: 'Video izleme ödülü'
      }
    });

    res.json({
      tokens: updated.tokens,
      watchedVideosToday,
      canWatchMore: watchedVideosToday < 3
    });
  } catch (error) {
    console.error("Watch video error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/daily-reward:
 *   post:
 *     summary: Günlük ödülü al
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Günlük ödül başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyRewardResponse'
 *       400:
 *         description: Günlük ödül zaten alınmış
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const claimDailyReward = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const now = new Date();
    
    // Bugün ödül alınmış mı kontrol et
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastReward = await prisma.tokenLog.findFirst({
      where: {
        userId: req.user.userId,
        type: 'daily_reward',
        createdAt: {
          gte: today
        }
      }
    });

    if (lastReward) {
      return res.status(400).json({ error: "Günlük ödül zaten alınmış" });
    }

    const rewardAmount = 5;
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { tokens: { increment: rewardAmount } },
    });

    // Token log kaydı
    await prisma.tokenLog.create({
      data: {
        userId: req.user.userId,
        amount: rewardAmount,
        type: 'daily_reward',
        description: 'Günlük giriş ödülü'
      }
    });

    res.json({
      tokens: updated.tokens,
      rewardAmount,
      message: "Günlük ödül başarıyla alındı"
    });
  } catch (error) {
    console.error("Daily reward error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/purchase:
 *   post:
 *     summary: Token satın al
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseTokensRequest'
 *     responses:
 *       200:
 *         description: Token başarıyla satın alındı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Geçersiz paket veya ödeme hatası
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const purchaseTokens = async (req, res) => {
  try {
    const { packageId, paymentMethod, amount } = req.body;

    // Token paketleri
    const packages = {
      'small': { tokens: 50, price: 5 },
      'medium': { tokens: 150, price: 10 },
      'large': { tokens: 500, price: 25 }
    };

    const packageInfo = packages[packageId];
    if (!packageInfo) {
      return res.status(400).json({ error: "Geçersiz paket" });
    }

    // Ödeme işlemi burada yapılacak (şimdilik simüle ediyoruz)
    // const paymentResult = await processPayment(paymentMethod, packageInfo.price);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { tokens: { increment: packageInfo.tokens } },
    });

    // Token log kaydı
    await prisma.tokenLog.create({
      data: {
        userId: req.user.userId,
        amount: packageInfo.tokens,
        type: 'purchase',
        description: `Token paketi satın alındı: ${packageId}`
      }
    });

    res.json({
      tokens: user.tokens,
      log: {
        amount: packageInfo.tokens,
        type: 'purchase',
        description: `Token paketi satın alındı: ${packageId}`,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error("Purchase tokens error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /tokens/history:
 *   get:
 *     summary: Token geçmişini getir
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Atlanacak kayıt sayısı
 *     responses:
 *       200:
 *         description: Token geçmişi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TokenLog'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getTokenHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const history = await prisma.tokenLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(history);
  } catch (error) {
    console.error("Get token history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 