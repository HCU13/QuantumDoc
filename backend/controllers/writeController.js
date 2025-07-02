import { PrismaClient } from "@prisma/client";
import { askClaude } from "../utils/claude.js";
const prisma = new PrismaClient();

const WRITE_TOKEN_COST = 3;

function getContentTypeLabel(type) {
  const map = {
    blog: "Blog Yazısı",
    social: "Sosyal Medya",
    email: "E-posta",
    story: "Hikaye",
    academic: "Akademik",
    business: "İş Metni",
    cv: "CV/Özgeçmiş",
    product: "Ürün Açıklaması",
    recipe: "Yemek Tarifi",
    poem: "Şiir/Şarkı Sözü",
    news: "Haber Makalesi",
    speech: "Konuşma/Sunum"
  };
  return map[type] || type;
}
function getToneLabel(tone) {
  const map = {
    professional: "Profesyonel",
    casual: "Günlük",
    formal: "Resmi",
    friendly: "Arkadaşça",
    persuasive: "İkna Edici",
    humorous: "Mizahi",
    inspirational: "İlham Verici",
    educational: "Eğitici"
  };
  return map[tone] || tone;
}
function getLengthLabel(length) {
  const map = {
    short: "Kısa (250-300 kelime)",
    medium: "Orta (500-600 kelime)",
    long: "Uzun (1000+ kelime)"
  };
  return map[length] || length;
}
function getLanguageLabel(lang) {
  const map = {
    tr: "Türkçe",
    en: "İngilizce",
    de: "Almanca",
    fr: "Fransızca",
    es: "İspanyolca"
  };
  return map[lang] || lang;
}

export const getWriteLogs = async (req, res) => {
  const logs = await prisma.writeLog.findMany({ where: { userId: req.user.userId } });
  res.json(logs);
};

export const addWriteLog = async (req, res) => {
  const { topic, contentType, tone, length, language } = req.body;
  const userId = req.user.userId;
  if (!topic) return res.status(400).json({ error: "Konu gerekli" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.tokens < WRITE_TOKEN_COST) {
    return res.status(400).json({ error: "Yetersiz token" });
  }
  // Prompt oluştur
  const prompt = `Lütfen aşağıdaki özelliklerde bir metin oluştur:\n- Konu: ${topic}\n- İçerik tipi: ${getContentTypeLabel(contentType)}\n- Ton: ${getToneLabel(tone)}\n- Uzunluk: ${getLengthLabel(length)}\n- Dil: ${getLanguageLabel(language)}`;
  let result = "";
  try {
    result = await askClaude(prompt);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  const log = await prisma.writeLog.create({
    data: { prompt, result, userId }
  });
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: WRITE_TOKEN_COST } }
  });
  await prisma.tokenLog.create({
    data: {
      userId,
      amount: -WRITE_TOKEN_COST,
      type: "use",
      description: "Metin üretimi için token harcandı"
    }
  });
  res.json(log);
}; 