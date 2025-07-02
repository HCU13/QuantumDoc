import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSubscription = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json({
    plan: user.subscriptionPlan,
    validUntil: user.subscriptionValidUntil,
  });
};

export const upgradeSubscription = async (req, res) => {
  const { plan } = req.body;
  if (!plan || !["free", "premium", "unlimited"].includes(plan)) {
    return res.status(400).json({ error: "Geçersiz plan" });
  }
  // Plan süresi: premium ve unlimited için 1 ay ekle
  let validUntil = null;
  if (plan !== "free") {
    validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);
  }
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      subscriptionPlan: plan,
      subscriptionValidUntil: validUntil,
    },
  });
  res.json({ plan: user.subscriptionPlan, validUntil: user.subscriptionValidUntil });
};

export const cancelSubscription = async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      subscriptionPlan: "free",
      subscriptionValidUntil: null,
    },
  });
  res.json({ plan: user.subscriptionPlan, validUntil: user.subscriptionValidUntil });
};

export const getSubscriptionHistory = async (req, res) => {
  const logs = await prisma.subscriptionLog.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(logs);
}; 