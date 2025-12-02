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

// ✅ LISTA DE DOMINIOS PERMITIDOS - AGREGA TU IP
const allowedOrigins = [
  "https://el-gran-azul.vercel.app",     
  "https://el-gran-azul-c2d7.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.1.68:5173"
];

console.log("✅ Dominios permitidos:", allowedOrigins);

// ✅ CONFIGURACIÓN PRINCIPAL DE CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origin
    if (!origin) return callback(null, true);
    
    // Verifica si el origen está permitido
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Origen bloqueado:", origin);
      callback(new Error("Origen no permitido"), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ✅ HEADERS ADICIONALES PARA ASEGURAR
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Solo permite orígenes en la lista
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  next();
});

app.use(express.json());

// ✅ HEALTH CHECK PARA VERIFICAR
app.get("/health", (req, res) => {
  console.log("🔍 Health check llamado desde:", req.headers.origin);
  res.json({
    status: "OK",
    serverTime: new Date().toISOString(),
    yourOrigin: req.headers.origin || "No origin header",
    allowedOrigins: allowedOrigins
  });
});

// ✅ TUS RUTAS
app.use("/", backupRouter);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", postImagesRouter);
app.use("/api/posts", likeRoutes);

export { app };