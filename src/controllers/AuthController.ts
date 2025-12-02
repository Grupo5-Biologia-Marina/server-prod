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

    // Normalizar email para búsqueda
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await UserModel.findOne({ where: { email: normalizedEmail } });
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
      email: normalizedEmail, // Guardar email normalizado
      password: hashedPassword,
      role: "user",
    });

    console.log(`✅ Usuario creado: ${user.username} (${user.email})`);

    // Enviar email de bienvenida (no bloqueante)
    sendWelcomeEmail(normalizedEmail, username)
      .then(() => console.log(`📧 Email de bienvenida enviado a ${normalizedEmail}`))
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

    // Normalizar email para búsqueda
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ where: { email: normalizedEmail } });

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

    // ✅ NORMALIZAR EL EMAIL
    const cleanEmail = email.trim().toLowerCase();
    console.log("📧 Email recibido:", `"${email}"`);
    console.log("📧 Email normalizado:", `"${cleanEmail}"`);

    // 1. Verificar si el usuario existe
    console.log("🔍 Buscando usuario en la base de datos...");
    const user = await UserModel.findOne({ where: { email: cleanEmail } });

    // ✅ LOG DETALLADO
    if (user) {
      console.log("✅ USUARIO ENCONTRADO:", {
        id: user.id,
        email: user.email,
        username: user.username
      });
    } else {
      console.log("❌ USUARIO NO ENCONTRADO para email:", cleanEmail);

      // ✅ DEBUG: Verificar todos los emails en la BD
      try {
        const allUsers = await UserModel.findAll({
          attributes: ['id', 'email', 'username'],
          limit: 10
        });
        console.log("📋 Usuarios en BD:", allUsers.map(u => ({
          id: u.id,
          email: `"${u.email}"`,
          username: u.username
        })));
      } catch (dbError) {
        console.error("❌ Error obteniendo usuarios:", dbError);
      }
    }

    // Por seguridad, siempre devolvemos el mismo mensaje
    const responseMessage = "Si el email existe, recibirás un enlace para restablecer tu contraseña";

    if (!user) {
      console.log(`❌ Email no encontrado después de búsqueda: ${cleanEmail}`);
      // ✅ CAMBIAR A success: false para que el frontend sepa que hay problema
      res.json({
        success: false,  // ⚠️ CAMBIO IMPORTANTE
        message: responseMessage
      });
      return;
    }

    // 2. Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    console.log("🔄 Actualizando usuario con token de reset...");

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

    console.log(`✅ Token de recuperación generado para: ${user.email}`);
    console.log(`🕐 Token expira: ${resetTokenExpiry}`);

    // 4. Enviar email con enlace
    const resetUrl = `${process.env.FRONTEND_URL || 'https://el-gran-azul-c2d7.vercel.app'}/reset-password/${resetToken}`;
    console.log("🔗 URL de reset generada:", resetUrl);

    try {
      console.log("📨 Intentando enviar email...");
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log(`✅ Email de recuperación enviado a: ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Error enviando email de recuperación:`, emailError);
      // No re-lanzamos el error para no revelar información
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

// GET CURRENT USER INFO
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("👤 Solicitud de información de usuario actual");

    // El middleware authMiddleware debe adjuntar el user al request
    const userFromToken = (req as any).user;

    if (!userFromToken || !userFromToken.id) {
      console.log("❌ No hay usuario en el request - Token inválido o middleware faltante");
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado"
      });
      return;
    }

    console.log("🔍 Buscando usuario en BD con ID:", userFromToken.id);

    // Buscar usuario en la base de datos - SIN createdAt (puede no existir)
    const dbUser = await UserModel.findByPk(userFromToken.id, {
      attributes: ['id', 'username', 'email', 'firstname', 'lastname', 'role', 'img']
    });

    if (!dbUser) {
      console.log("❌ Usuario no encontrado en BD para ID:", userFromToken.id);
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
      return;
    }

    console.log("✅ Usuario encontrado:", dbUser.username);

    res.json({
      success: true,
      data: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        firstname: dbUser.firstname,
        lastname: dbUser.lastname,
        role: dbUser.role,
        img: dbUser.img
      }
    });

  } catch (error: any) {
    console.error("❌ Error en getCurrentUser:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};