import { Router } from "express";
import { 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from "../controllers/AuthController";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { authenticate } from "../middlewares/authMiddleware";
import { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} from "../validators/authValidations";

const router = Router();

// Rutas de autenticación
router.post("/register", registerValidation, validationMiddleware, registerUser);
router.post("/login", loginValidation, validationMiddleware, loginUser);
router.post("/forgot-password", forgotPasswordValidation, validationMiddleware, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidation, validationMiddleware, resetPassword);

// ✅ NUEVA RUTA - Obtener usuario actual
router.get("/me", authenticate, getCurrentUser);

// Ruta de logout
router.post("/logout", (req, res) => {
  res.clearCookie("token"); 
  res.status(200).json({ 
    success: true, 
    message: "Sesión cerrada correctamente" 
  });
});

export default router;