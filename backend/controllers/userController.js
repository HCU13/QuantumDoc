import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Kullanıcının tam adı
 *         phone:
 *           type: string
 *           description: Telefon numarası
 *         language:
 *           type: string
 *           description: Dil tercihi (tr, en)
 *         theme:
 *           type: string
 *           description: Tema tercihi (light, dark)
 *         profileImage:
 *           type: string
 *           description: Profil resmi URL'i
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Mevcut şifre
 *         newPassword:
 *           type: string
 *           description: Yeni şifre
 *     DeleteAccountRequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           description: Hesap silme onayı için şifre
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Kullanıcı profil bilgilerini getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        language: true,
        theme: true,
        profileImage: true,
        lastLoginAt: true,
        subscriptionPlan: true,
        subscriptionValidUntil: true,
        tokens: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile get error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Kullanıcı profil bilgilerini güncelle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, language, theme, profileImage } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        language: language || undefined,
        theme: theme || undefined,
        profileImage: profileImage || undefined
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        language: true,
        theme: true,
        profileImage: true,
        lastLoginAt: true,
        subscriptionPlan: true,
        subscriptionValidUntil: true,
        tokens: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Kullanıcı şifresini değiştir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Geçersiz şifre
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /user/account:
 *   delete:
 *     summary: Kullanıcı hesabını sil
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAccountRequest'
 *     responses:
 *       200:
 *         description: Hesap başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Geçersiz şifre
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Password is incorrect" });
    }

    // Kullanıcıyı ve ilişkili tüm verilerini sil
    await prisma.user.delete({
      where: { id: req.user.userId }
    });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /user/upload-profile-image:
 *   post:
 *     summary: Profil resmi yükle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profil resmi dosyası
 *     responses:
 *       200:
 *         description: Profil resmi başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileImage:
 *                   type: string
 *                   description: Yüklenen resmin URL'i
 *       400:
 *         description: Geçersiz dosya
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/profile/${req.file.filename}`;

    // Kullanıcının profil resmini güncelle
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profileImage: imageUrl }
    });

    res.json({ profileImage: imageUrl });
  } catch (error) {
    console.error("Upload profile image error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 