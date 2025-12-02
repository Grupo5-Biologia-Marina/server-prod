import { Router } from "express";
import { 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser  // ← Asegúrate de agregar esta import
} from "../controllers/AuthController";
import { validationMiddleware } from "../middlewares/validationMiddleware";
import { authenticate } from "../middlewares/authMiddleware"; // ← Cambia de authMiddleware a authenticate
import { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} from "../validators/authValidations";

const router = Router();

// ✅ Rutas públicas
router.post("/register", registerValidation, validationMiddleware, registerUser);
router.post("/login", loginValidation, validationMiddleware, loginUser);
router.post("/forgot-password", forgotPasswordValidation, validationMiddleware, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidation, validationMiddleware, resetPassword);

// ✅ Ruta protegida - Obtener usuario actual (usa authenticate)
router.get("/me", authenticate, getCurrentUser); // ← ¡USA authenticate!

// ✅ Ruta de logout
router.post("/logout", (req, res) => {
  res.clearCookie("token"); 
  res.status(200).json({ 
    success: true, 
    message: "Sesión cerrada correctamente" 
  });
});

export default router;