import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         type:
 *           type: string
 *           description: Aktivite türü (login, note_create, task_complete, chat_start, math_solve, translate, write_generate)
 *         title:
 *           type: string
 *           description: Aktivite başlığı
 *         description:
 *           type: string
 *           description: Aktivite açıklaması
 *         metadata:
 *           type: object
 *           description: Ek veriler (JSON formatında)
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateActivityRequest:
 *       type: object
 *       required:
 *         - type
 *         - title
 *       properties:
 *         type:
 *           type: string
 *           description: Aktivite türü
 *         title:
 *           type: string
 *           description: Aktivite başlığı
 *         description:
 *           type: string
 *           description: Aktivite açıklaması
 *         metadata:
 *           type: object
 *           description: Ek veriler
 */

/**
 * @swagger
 * /activity:
 *   get:
 *     summary: Kullanıcının aktivite geçmişini getir
 *     tags: [Activity]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Aktivite türüne göre filtrele
 *     responses:
 *       200:
 *         description: Aktivite geçmişi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getActivities = async (req, res) => {
  try {
    const { limit = 20, offset = 0, type } = req.query;
    
    const whereClause = {
      userId: req.user.userId
    };

    if (type) {
      whereClause.type = type;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(activities);
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /activity:
 *   post:
 *     summary: Yeni aktivite kaydı oluştur
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityRequest'
 *     responses:
 *       201:
 *         description: Aktivite başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const createActivity = async (req, res) => {
  try {
    const { type, title, description, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: "Type and title are required" });
    }

    const activity = await prisma.activity.create({
      data: {
        userId: req.user.userId,
        type,
        title,
        description,
        metadata: metadata || {}
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /activity/stats:
 *   get:
 *     summary: Kullanıcının aktivite istatistiklerini getir
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aktivite istatistikleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalActivities:
 *                   type: integer
 *                 todayActivities:
 *                   type: integer
 *                 thisWeekActivities:
 *                   type: integer
 *                 thisMonthActivities:
 *                   type: integer
 *                 activityTypes:
 *                   type: object
 *                   description: Aktivite türlerine göre sayılar
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getActivityStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [totalActivities, todayActivities, thisWeekActivities, thisMonthActivities, activityTypes] = await Promise.all([
      prisma.activity.count({ where: { userId: req.user.userId } }),
      prisma.activity.count({ 
        where: { 
          userId: req.user.userId,
          createdAt: { gte: today }
        }
      }),
      prisma.activity.count({ 
        where: { 
          userId: req.user.userId,
          createdAt: { gte: weekAgo }
        }
      }),
      prisma.activity.count({ 
        where: { 
          userId: req.user.userId,
          createdAt: { gte: monthAgo }
        }
      }),
      prisma.activity.groupBy({
        by: ['type'],
        where: { userId: req.user.userId },
        _count: { type: true }
      })
    ]);

    const activityTypeStats = {};
    activityTypes.forEach(item => {
      activityTypeStats[item.type] = item._count.type;
    });

    res.json({
      totalActivities,
      todayActivities,
      thisWeekActivities,
      thisMonthActivities,
      activityTypes: activityTypeStats
    });
  } catch (error) {
    console.error("Get activity stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /activity/recent:
 *   get:
 *     summary: Son aktiviteleri getir
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Kayıt sayısı
 *     responses:
 *       200:
 *         description: Son aktiviteler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const activities = await prisma.activity.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(activities);
  } catch (error) {
    console.error("Get recent activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 