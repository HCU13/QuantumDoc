import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import tokensRoutes from "./routes/tokens.js";
import subscriptionRoutes from "./routes/subscription.js";
import userRoutes from "./routes/user.js";
import newsRoutes from "./routes/news.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import notesRoutes from "./routes/notes.js";
import tasksRoutes from "./routes/tasks.js";
import mathRoutes from "./routes/math.js";
import translateRoutes from "./routes/translate.js";
import writeRoutes from "./routes/write.js";
import activityRoutes from "./routes/activity.js";
import searchRoutes from "./routes/search.js";
import settingsRoutes from "./routes/settings.js";
import supportRoutes from "./routes/support.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QuantumDoc API",
      version: "1.0.0",
      description: "QuantumDoc mobil uygulaması için API dokümantasyonu",
    },
    servers: [{ url: "http://localhost:5001" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("QuantumDoc API is running!");
});

// Claude AI endpoint placeholder
app.post("/api/ai/claude", async (req, res) => {
  // Claude entegrasyonu burada olacak
  res.json({ reply: "Claude AI integration coming soon!" });
});

app.use("/tokens", tokensRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/notes", notesRoutes);
app.use("/tasks", tasksRoutes);
app.use("/math", mathRoutes);
app.use("/translate", translateRoutes);
app.use("/write", writeRoutes);
app.use("/activity", activityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/support", supportRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
});
