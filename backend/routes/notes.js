import express from "express";
import { getNotes, addNote, updateNote, deleteNote, addNoteAI } from "../controllers/notesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotes);
router.post("/", addNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/ai", addNoteAI);

export default router; 