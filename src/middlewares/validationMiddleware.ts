import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 Validando request para:", req.method, req.path);
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.warn("❌ Errores de validación:", errors.array());
    
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : err.type,
        message: err.msg
      }))
    });
  }
  
  console.log("✅ Validación pasada");
  next();
};