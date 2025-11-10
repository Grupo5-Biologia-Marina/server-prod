import { Router } from "express";
import { 
  registerUser, 
  loginUser
} from "../controllers/AuthController";
// Importa las funciones específicamente
import { forgotPassword } from "../controllers/AuthController";
import { resetPassword } from "../controllers/AuthController";
import { validationMiddleware } from "../middlewares/validationMiddleware";
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

// Ruta de logout
router.post("/logout", (req, res) => {
  res.clearCookie("token"); 
  res.status(200).json({ 
    success: true, 
    message: "Sesión cerrada correctamente" 
  });
});

export default router;