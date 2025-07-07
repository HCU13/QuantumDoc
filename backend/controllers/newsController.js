import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         imageUrl:
 *           type: string
 *         icon:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         actionUrl:
 *           type: string
 *         actionText:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateNewsRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         imageUrl:
 *           type: string
 *         icon:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: integer
 *         actionUrl:
 *           type: string
 *         actionText:
 *           type: string
 *     UpdateNewsRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         imageUrl:
 *           type: string
 *         icon:
 *           type: string
 *         category:
 *           type: string
 *         priority:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         actionUrl:
 *           type: string
 *         actionText:
 *           type: string
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Tüm aktif haberleri getir
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Haber kategorisi (general, update, feature, campaign)
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Sadece öne çıkan haberleri getir
 *     responses:
 *       200:
 *         description: Haberler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Tüm aktif haberleri getir
const getAllNews = async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const whereClause = {
      isActive: true,
    };

    // Kategori filtresi
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Featured filtresi
    if (featured === 'true') {
      whereClause.featured = true;
    }

    const news = await prisma.news.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: ID'ye göre haber getir
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Haber ID
 *     responses:
 *       200:
 *         description: Haber başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: Haber bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Tek bir haberi getir
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const news = await prisma.news.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Yeni haber oluştur (Admin)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNewsRequest'
 *     responses:
 *       201:
 *         description: Haber başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// Yeni haber oluştur (Admin)
const createNews = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      imageUrl,
      icon,
      category,
      priority,
      actionUrl,
      actionText,
    } = req.body;

    const news = await prisma.news.create({
      data: {
        title,
        description,
        content,
        imageUrl,
        icon,
        category,
        priority: priority || 0,
        actionUrl,
        actionText,
      },
    });

    res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Haber güncelle (Admin)
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content,
      imageUrl,
      icon,
      category,
      isActive,
      priority,
      actionUrl,
      actionText,
    } = req.body;

    const news = await prisma.news.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        description,
        content,
        imageUrl,
        icon,
        category,
        isActive,
        priority,
        actionUrl,
        actionText,
      },
    });

    res.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Haber sil (Admin)
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.news.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Kategoriye göre haberleri getir
const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const news = await prisma.news.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    res.json(news);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsByCategory,
}; 