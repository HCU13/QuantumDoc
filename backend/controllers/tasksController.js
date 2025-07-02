import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { userId: req.user.userId } });
  res.json(tasks);
};

export const addTask = async (req, res) => {
  const { title, completed } = req.body;
  const task = await prisma.task.create({
    data: { title, completed: !!completed, userId: req.user.userId }
  });
  res.json(task);
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const task = await prisma.task.update({
    where: { id: Number(id), userId: req.user.userId },
    data: { title, completed: !!completed }
  });
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  await prisma.task.delete({ where: { id: Number(id), userId: req.user.userId } });
  res.json({ success: true });
}; 