import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();
let resetTokens = {};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         phone:
 *           type: string
 *         language:
 *           type: string
 *         theme:
 *           type: string
 *         profileImage:
 *           type: string
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         subscriptionPlan:
 *           type: string
 *         subscriptionValidUntil:
 *           type: string
 *           format: date-time
 *         tokens:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         user:
 *           $ref: '#/components/schemas/User'
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Kullanıcı e-posta adresi
 *         password:
 *           type: string
 *           description: Kullanıcı şifresi
 *         fullName:
 *           type: string
 *           description: Kullanıcının tam adı
 *         phone:
 *           type: string
 *           description: Telefon numarası (opsiyonel)
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Kullanıcı e-posta adresi
 *         password:
 *           type: string
 *           description: Kullanıcı şifresi
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 6
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Başarılı kayıt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Geçersiz veri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: E-posta zaten kullanımda
 *       500:
 *         description: Sunucu hatası
 */
export const register = async (req, res) => {
  const { email, password, fullName, phone } = req.body;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(409).json({ error: "Email already exists" });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      phone: phone || null
    }
  });
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
  const userResponse = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    language: user.language,
    theme: user.theme,
    profileImage: user.profileImage,
    lastLoginAt: user.lastLoginAt,
    phone: user.phone,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionValidUntil: user.subscriptionValidUntil,
    tokens: user.tokens,
    createdAt: user.createdAt
  };
  
  res.status(201).json({ token, user: userResponse });
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Sunucu hatası
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  
  // Last login'i güncelle
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
  // Kullanıcı bilgilerini döndür (telefon dahil)
  const userResponse = {
    id: updatedUser.id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    language: updatedUser.language,
    theme: updatedUser.theme,
    profileImage: updatedUser.profileImage,
    lastLoginAt: updatedUser.lastLoginAt,
    phone: updatedUser.phone,
    subscriptionPlan: updatedUser.subscriptionPlan,
    subscriptionValidUntil: updatedUser.subscriptionValidUntil,
    tokens: updatedUser.tokens,
    createdAt: updatedUser.createdAt
  };
  
  res.json({ token, user: userResponse });
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama isteği
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcı e-posta adresi
 *     responses:
 *       200:
 *         description: Şifre sıfırlama e-postası gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  
  // Şifre sıfırlama e-postası gönderme işlemi burada yapılacak
  // Şimdilik sadece başarılı yanıt döndürüyoruz
  
  res.json({ message: "Password reset email sent" });
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Şifre sıfırlama
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Token geçersiz veya süresi dolmuş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const data = resetTokens[token];
  if (!data || data.expires < Date.now()) return res.status(400).json({ error: "Token geçersiz veya süresi dolmuş" });
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: data.userId }, data: { password: hashed } });
  delete resetTokens[token];
  res.json({ message: "Şifre başarıyla güncellendi" });
}; 