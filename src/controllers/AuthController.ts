import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import UserModel from "../models/UserModel";
import { sendWelcomeEmail } from "../utils/mailer";
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from "../utils/emailService";

const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// REGISTER USER
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📝 Solicitud de registro recibida");

    const { username, firstname, lastname, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: "Faltan datos obligatorios: username, email y password son requeridos" 
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false, 
        message: "Formato de email inválido" 
      });
      return;
    }

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ 
        success: false, 
        message: "Este email ya está registrado" 
      });
      return;
    }

    const existingUsername = await UserModel.findOne({ where: { username } });
    if (existingUsername) {
      res.status(409).json({ 
        success: false, 
        message: "Este nombre de usuario ya está en uso" 
      });
      return;
    }

    const hashedPassword = hashPassword(password);

    const user = await UserModel.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: "user",
    });

    console.log(`✅ Usuario creado: ${user.username} (${user.email})`);

    sendWelcomeEmail(email, username)
      .then(() => console.log(`📧 Email de bienvenida enviado a ${email}`))
      .catch((error) => console.error(`⚠️ Error enviando email (no crítico):`, error.message));

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado con éxito",
      token,
      data: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en registerUser:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor durante el registro",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// LOGIN USER
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔐 Solicitud de login recibida");

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: "Email y password son obligatorios" 
      });
      return;
    }

    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: "Credenciales inválidas" 
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ 
        success: false, 
        message: "Credenciales inválidas" 
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "24h" }
    );

    console.log(`✅ Login exitoso para: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor durante el login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔐 Solicitud de recuperación de contraseña recibida");

    const { email } = req.body;

    if (!email) {
      res.status(400).json({ 
        success: false, 
        message: "El email es obligatorio" 
      });
      return;
    }

    // 1. Verificar si el usuario existe
    const user = await UserModel.findOne({ where: { email } });
    
    // Por seguridad, siempre devolvemos el mismo mensaje
    const responseMessage = "Si el email existe, recibirás un enlace para restablecer tu contraseña";

    if (!user) {
      console.log(`❌ Email no encontrado: ${email}`);
      res.json({ 
        success: true,
        message: responseMessage 
      });
      return;
    }

    // 2. Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // 3. Guardar token en la base de datos
    await UserModel.update(
      {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      },
      {
        where: { id: user.id }
      }
    );

    console.log(`✅ Token de recuperación generado para: ${email}`);

    // 4. Enviar email con enlace
    const resetUrl = `${process.env.FRONTEND_URL || 'https://el-gran-azul-c2d7.vercel.app'}/reset-password/${resetToken}`;
    
    try {
      await sendPasswordResetEmail(email, resetUrl);
      console.log(`📧 Email de recuperación enviado a: ${email}`);
    } catch (emailError) {
      console.error(`⚠️ Error enviando email de recuperación:`, emailError);
    }

    res.json({ 
      success: true,
      message: responseMessage
    });
  } catch (error: any) {
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor durante la recuperación de contraseña",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔐 Solicitud de restablecimiento de contraseña recibida");

    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ 
        success: false, 
        message: "La nueva contraseña es obligatoria" 
      });
      return;
    }

    // 1. Buscar usuario con token válido
    const user = await UserModel.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({ 
        success: false, 
        message: "El enlace de restablecimiento es inválido o ha expirado" 
      });
      return;
    }

    // 2. Verificar que la nueva contraseña sea diferente a la anterior
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      res.status(400).json({ 
        success: false, 
        message: "La nueva contraseña no puede ser igual a la anterior" 
      });
      return;
    }

    // 3. Hashear nueva contraseña
    const hashedPassword = hashPassword(password);
    
    // 4. Actualizar contraseña y limpiar token
    await UserModel.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      {
        where: { id: user.id }
      }
    );

    console.log(`✅ Contraseña actualizada para: ${user.email}`);

    // 5. Enviar email de confirmación
    try {
      await sendPasswordResetConfirmationEmail(user.email);
      console.log(`📧 Email de confirmación enviado a: ${user.email}`);
    } catch (emailError) {
      console.error(`⚠️ Error enviando email de confirmación:`, emailError);
    }

    res.json({ 
      success: true, 
      message: "Contraseña actualizada exitosamente" 
    });
  } catch (error: any) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor durante el restablecimiento de contraseña",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};