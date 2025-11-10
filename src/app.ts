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

// ✅ Configuración segura y dinámica de CORS - ACTUALIZADA
const allowedOrigins = [
  "https://el-gran-azul-c2d7.vercel.app", // producción Vercel
  "http://localhost:5173", // desarrollo local Vite
  "http://localhost:3000", // desarrollo tradicional
];

// Si hay FRONTEND_URL en las variables, la agregamos
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(",");
  allowedOrigins.push(...envOrigins);
}

console.log("🌐 Dominios permitidos por CORS:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para origen:", origin);
        callback(null, false); // Cambiado a null para evitar throw
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    allowedOrigins 
  });
});

// ✅ Rutas principales
app.use("/", backupRouter);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", postImagesRouter);
app.use("/api/posts", likeRoutes);

export { app };