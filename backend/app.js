import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import tokensRoutes from "./routes/tokens.js";
import subscriptionRoutes from "./routes/subscription.js";
import userRoutes from "./routes/user.js";
const newsRoutes = require('./routes/news');

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
    servers: [
      { url: "http://localhost:3001" }
    ],
  },
  apis: [
    "./routes/*.js",
    "./controllers/*.js"
  ],
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
app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));