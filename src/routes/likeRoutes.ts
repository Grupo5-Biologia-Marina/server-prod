import { Router } from "express";
import { getLikeInfo, toggleLike } from "../controllers/LikeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// ✅ RUTAS CORRECTAS (usa :postId en lugar de :id)
router.get("/:id/likes", authenticate, getLikeInfo);
router.post("/:id/likes", authenticate, toggleLike);

export default router;