import { PrismaClient } from "@prisma/client";
import { askClaude } from "../utils/claude.js";
const prisma = new PrismaClient();

const TRANSLATE_TOKEN_COST = 1;

export const getTranslateLogs = async (req, res) => {
  const logs = await prisma.translateLog.findMany({ where: { userId: req.user.userId } });
  res.json(logs);
};

export const addTranslateLog = async (req, res) => {
  const { sourceText, sourceLang, targetLang } = req.body;
  const userId = req.user.userId;
  if (!sourceText || !sourceLang || !targetLang) return res.status(400).json({ error: "Eksik parametre" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.tokens < TRANSLATE_TOKEN_COST) {
    return res.status(400).json({ error: "Yetersiz token" });
  }
  // Prompt oluştur
  const prompt = `Lütfen aşağıdaki metni ${sourceLang} dilinden ${targetLang} diline çevir:\n${sourceText}`;
  let translatedText = "";
  try {
    translatedText = await askClaude(prompt);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  const log = await prisma.translateLog.create({
    data: { sourceText, translatedText, sourceLang, targetLang, userId }
  });
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: TRANSLATE_TOKEN_COST } }
  });
  await prisma.tokenLog.create({
    data: {
      userId,
      amount: -TRANSLATE_TOKEN_COST,
      type: "use",
      description: "Çeviri için token harcandı"
    }
  });
  res.json(log);
}; 