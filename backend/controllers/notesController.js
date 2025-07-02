import { PrismaClient } from "@prisma/client";
import { askClaude } from "../utils/claude.js";
const prisma = new PrismaClient();

const NOTE_AI_TOKEN_COST = 1;

export const getNotes = async (req, res) => {
  const notes = await prisma.note.findMany({ where: { userId: req.user.userId } });
  res.json(notes);
};

export const addNote = async (req, res) => {
  const { title, content, category, color } = req.body;
  const note = await prisma.note.create({
    data: {
      title,
      content,
      category,
      color,
      userId: req.user.userId,
    },
  });
  res.json(note);
};

export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, category, color } = req.body;
  const note = await prisma.note.update({
    where: { id: Number(id), userId: req.user.userId },
    data: { title, content, category, color },
  });
  res.json(note);
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;
  await prisma.note.delete({ where: { id: Number(id), userId: req.user.userId } });
  res.json({ success: true });
};

export const addNoteAI = async (req, res) => {
  const { content, action } = req.body;
  const userId = req.user.userId;
  if (!content || !action) return res.status(400).json({ error: "Eksik parametre" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.tokens < NOTE_AI_TOKEN_COST) {
    return res.status(400).json({ error: "Yetersiz token" });
  }
  let prompt = "";
  switch (action) {
    case "summarize":
      prompt = `Aşağıdaki notu özetler misin?\n\n${content}`;
      break;
    case "rewrite":
      prompt = `Aşağıdaki notu daha profesyonel bir dille yeniden yazar mısın?\n\n${content}`;
      break;
    case "expand":
      prompt = `Aşağıdaki notu daha detaylı ve açıklayıcı hale getirir misin?\n\n${content}`;
      break;
    case "grammar":
      prompt = `Aşağıdaki notun dilbilgisi ve yazım hatalarını düzeltir misin?\n\n${content}`;
      break;
    default:
      return res.status(400).json({ error: "Geçersiz işlem" });
  }
  let aiResult = "";
  try {
    aiResult = await askClaude(prompt);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: NOTE_AI_TOKEN_COST } }
  });
  await prisma.tokenLog.create({
    data: {
      userId,
      amount: -NOTE_AI_TOKEN_COST,
      type: "use",
      description: `Not AI işlemi (${action}) için token harcandı`
    }
  });
  res.json({ result: aiResult });
}; 