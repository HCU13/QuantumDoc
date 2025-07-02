import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllActivities = async (req, res) => {
  const userId = req.user.userId;
  const { type, limit = 20 } = req.query;
  const take = parseInt(limit, 10) || 20;

  // Her modülden son aktiviteleri çek
  const [notes, chats, mathLogs, writeLogs, translateLogs, tasks] = await Promise.all([
    prisma.note.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.chat.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.mathLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.writeLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.translateLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
  ]);

  // Her kaydı unified bir aktivite objesine dönüştür
  const activities = [
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "note",
      title: n.title,
      description: n.content?.slice(0, 60) || "",
      time: n.createdAt,
      content: n.content,
    })),
    ...chats.map((c) => ({
      id: `chat-${c.id}`,
      type: "chat",
      title: c.prompt?.slice(0, 30) || "Chat",
      description: c.response?.slice(0, 60) || "",
      time: c.createdAt,
      content: c.response,
    })),
    ...mathLogs.map((m) => ({
      id: `math-${m.id}`,
      type: "math",
      title: m.question?.slice(0, 30) || "Math",
      description: m.answer?.slice(0, 60) || "",
      time: m.createdAt,
      content: m.answer,
    })),
    ...writeLogs.map((w) => ({
      id: `write-${w.id}`,
      type: "write",
      title: w.prompt?.slice(0, 30) || "Write",
      description: w.result?.slice(0, 60) || "",
      time: w.createdAt,
      content: w.result,
    })),
    ...translateLogs.map((t) => ({
      id: `translate-${t.id}`,
      type: "translate",
      title: t.sourceText?.slice(0, 30) || "Translate",
      description: t.translatedText?.slice(0, 60) || "",
      time: t.createdAt,
      content: t.translatedText,
    })),
    ...tasks.map((tsk) => ({
      id: `task-${tsk.id}`,
      type: "task",
      title: tsk.title,
      description: tsk.completed ? "Tamamlandı" : "Devam ediyor",
      time: tsk.createdAt,
      content: "",
    })),
  ];

  // Zaman sırasına göre sırala (en yeni en üstte)
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Tip filtresi uygula (varsa)
  const filtered = type ? activities.filter((a) => a.type === type) : activities;

  res.json(filtered.slice(0, take));
};

export const getRecentActivities = async (req, res) => {
  const userId = req.user.userId;
  // Her modülden son 4 aktiviteyi çekmek için yeterli veri al
  const take = 4;
  const [notes, chats, mathLogs, writeLogs, translateLogs, tasks] = await Promise.all([
    prisma.note.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.chat.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.mathLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.writeLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.translateLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
    prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take }),
  ]);

  const activities = [
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "note",
      title: n.title,
      description: n.content?.slice(0, 60) || "",
      time: n.createdAt,
      content: n.content,
    })),
    ...chats.map((c) => ({
      id: `chat-${c.id}`,
      type: "chat",
      title: c.prompt?.slice(0, 30) || "Chat",
      description: c.response?.slice(0, 60) || "",
      time: c.createdAt,
      content: c.response,
    })),
    ...mathLogs.map((m) => ({
      id: `math-${m.id}`,
      type: "math",
      title: m.question?.slice(0, 30) || "Math",
      description: m.answer?.slice(0, 60) || "",
      time: m.createdAt,
      content: m.answer,
    })),
    ...writeLogs.map((w) => ({
      id: `write-${w.id}`,
      type: "write",
      title: w.prompt?.slice(0, 30) || "Write",
      description: w.result?.slice(0, 60) || "",
      time: w.createdAt,
      content: w.result,
    })),
    ...translateLogs.map((t) => ({
      id: `translate-${t.id}`,
      type: "translate",
      title: t.sourceText?.slice(0, 30) || "Translate",
      description: t.translatedText?.slice(0, 60) || "",
      time: t.createdAt,
      content: t.translatedText,
    })),
    ...tasks.map((tsk) => ({
      id: `task-${tsk.id}`,
      type: "task",
      title: tsk.title,
      description: tsk.completed ? "Tamamlandı" : "Devam ediyor",
      time: tsk.createdAt,
      content: "",
    })),
  ];

  // Zaman sırasına göre sırala (en yeni en üstte)
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json(activities.slice(0, 4));
}; 