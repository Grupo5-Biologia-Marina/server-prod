import { body } from "express-validator";

// Validación para registro - VERSIÓN COMPLETA
export const registerValidation = [
  body("username")
    .notEmpty().withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 3 }).withMessage("El nombre de usuario debe tener al menos 3 caracteres")
    .trim(),

  body("firstname")
    .optional({ checkFalsy: true }) // ← Opcional, acepta valores vacíos
    .isString().withMessage("El nombre debe ser un texto")
    .trim(),

  body("lastname")
    .optional({ checkFalsy: true }) // ← Opcional, acepta valores vacíos
    .isString().withMessage("El apellido debe ser un texto")
    .trim(),

  body("email")
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
    .trim()
];

// Validación para login
export const loginValidation = [
  body("email")
    .isEmail().withMessage("Debe ser un correo electrónico válido")
    .normalizeEmail()
    .trim(),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .trim()
];

// Validación para recuperación de contraseña
export const forgotPasswordValidation = [
  body("email")
    .isEmail().withMessage("Por favor proporciona un email válido")
    .normalizeEmail()
    .trim()
];

// Validación para restablecer contraseña
export const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
    .trim()
];