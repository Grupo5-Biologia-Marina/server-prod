import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import postImagesRouter from "./routes/postImages";
import likeRoutes from "./routes/likeRoutes";
import backupRouter from "./routes/backupRouter";

dotenv.config();

const app = express();

// ✅ Configuración segura y dinámica de CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [
      "http://localhost:5173", // desarrollo local
      "https://el-gran-azul-c2d7.vercel.app", // producción
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para origen:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Rutas principales
app.use("/", backupRouter);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", postImagesRouter);
app.use("/api/posts", likeRoutes);

export { app };
