import { PrismaClient } from "@prisma/client";
import { askClaude, fileToBase64 } from "../utils/claude.js";
const prisma = new PrismaClient();

const MATH_TOKEN_COST = 2;

export const getMathLogs = async (req, res) => {
  const logs = await prisma.mathLog.findMany({ where: { userId: req.user.userId } });
  res.json(logs);
};

export const addMathLog = async (req, res) => {
  const { question, stepByStep, imageUrl } = req.body;
  const userId = req.user.userId;
  // Kullanıcı token kontrolü
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.tokens < MATH_TOKEN_COST) {
    return res.status(400).json({ error: "Yetersiz token" });
  }
  // Prompt oluştur
  let prompt = question;
  if (stepByStep && user.subscriptionPlan === "premium") {
    prompt += "\nLütfen adım adım çözümle.";
  }
  // Görseli base64'e çevir
  let imageBase64 = undefined;
  if (imageUrl) {
    try {
      imageBase64 = fileToBase64(imageUrl);
    } catch (e) {
      return res.status(400).json({ error: "Görsel okunamadı" });
    }
  }
  // Claude AI'dan yanıt al
  let answer = "";
  try {
    answer = await askClaude(prompt, imageBase64);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  // MathLog kaydını oluştur
  const log = await prisma.mathLog.create({
    data: { question, answer, imageUrl, userId }
  });
  // Kullanıcıdan token düş
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: MATH_TOKEN_COST } }
  });
  // TokenLog kaydı
  await prisma.tokenLog.create({
    data: {
      userId,
      amount: -MATH_TOKEN_COST,
      type: "use",
      description: "Math AI çözümü için token harcandı"
    }
  });
  res.json(log);
};

export const uploadMathImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yok" });
  const { question, answer } = req.body;
  const userId = req.user.userId;
  const imageUrl = req.file.path;
  const mathLog = await prisma.mathLog.create({
    data: {
      question: question || "",
      answer: answer || "",
      imageUrl,
      userId,
    },
  });
  res.json({ id: mathLog.id, imageUrl: mathLog.imageUrl });
}; 