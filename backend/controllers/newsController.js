const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tüm aktif haberleri getir
const getAllNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: {
        isActive: true,
      },
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

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsByCategory,
}; 