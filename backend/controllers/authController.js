import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();
let resetTokens = {};

export const register = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, fullName }
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
  // Dummy token üret
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens[token] = { userId: user.id, expires: Date.now() + 1000 * 60 * 15 };
  // Dummy e-posta gönderimi
  console.log(`Şifre sıfırlama linki: http://localhost:5001/reset-password?token=${token}`);
  res.json({ message: "Şifre sıfırlama e-postası gönderildi (dummy)", token });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const data = resetTokens[token];
  if (!data || data.expires < Date.now()) return res.status(400).json({ error: "Token geçersiz veya süresi dolmuş" });
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: data.userId }, data: { password: hashed } });
  delete resetTokens[token];
  res.json({ message: "Şifre başarıyla güncellendi" });
}; 