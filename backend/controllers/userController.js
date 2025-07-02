import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    language: user.language,
    theme: user.theme,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionValidUntil: user.subscriptionValidUntil,
    tokens: user.tokens,
  });
};

export const updateProfile = async (req, res) => {
  const { fullName, email, language, theme, password, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  // Şifre güncelleme
  if (password && newPassword) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mevcut şifre yanlış" });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
  }

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      fullName: fullName ?? user.fullName,
      email: email ?? user.email,
      language: language ?? user.language,
      theme: theme ?? user.theme,
      password: user.password,
    },
  });
  res.json({
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    language: updated.language,
    theme: updated.theme,
    profileImage: updated.profileImage,
    createdAt: updated.createdAt,
    subscriptionPlan: updated.subscriptionPlan,
    subscriptionValidUntil: updated.subscriptionValidUntil,
    tokens: updated.tokens,
  });
};

export const uploadProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yok" });
  const imagePath = req.file.path;
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { profileImage: imagePath },
  });
  res.json({ profileImage: user.profileImage });
}; 