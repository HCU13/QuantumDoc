import express from "express";
import { getProfile, updateProfile, uploadProfileImage, deleteAccount } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();

const upload = multer({ dest: "uploads/profile/" });

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Kullanıcı profil ve ayarları
 */
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Kullanıcı profilini getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgisi
 *   put:
 *     summary: Kullanıcı profilini güncelle (ad, e-posta, dil, tema, şifre)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               language:
 *                 type: string
 *               theme:
 *                 type: string
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellenen profil
 * /user/profile/image:
 *   post:
 *     summary: Profil fotoğrafı yükle
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil fotoğrafı yüklendi
 */

router.use(authMiddleware);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/image", upload.single("image"), uploadProfileImage);
router.delete("/account", deleteAccount);

export default router; 