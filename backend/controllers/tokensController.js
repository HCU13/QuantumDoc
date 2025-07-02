import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTokens = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json({ tokens: user.tokens });
};

export const addTokens = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Geçersiz miktar" });
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { tokens: { increment: amount } },
  });
  res.json({ tokens: user.tokens });
};

export const useTokens = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Geçersiz miktar" });
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (user.tokens < amount) return res.status(400).json({ error: "Yetersiz token" });
  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: { tokens: { decrement: amount } },
  });
  res.json({ tokens: updated.tokens });
};

export const watchVideoForTokens = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const now = new Date();
  const isSameDay = user.lastVideoWatchDate &&
    now.getFullYear() === user.lastVideoWatchDate.getFullYear() &&
    now.getMonth() === user.lastVideoWatchDate.getMonth() &&
    now.getDate() === user.lastVideoWatchDate.getDate();
  let watchedVideosToday = isSameDay ? user.watchedVideosToday : 0;
  if (watchedVideosToday >= 3) return res.status(400).json({ error: "Günlük video izleme hakkı doldu" });
  watchedVideosToday++;
  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      tokens: { increment: 2 },
      watchedVideosToday,
      lastVideoWatchDate: now,
    },
  });
  res.json({ tokens: updated.tokens, watchedVideosToday });
};

export const getTokenHistory = async (req, res) => {
  const logs = await prisma.tokenLog.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(logs);
}; 