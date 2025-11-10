import nodemailer from "nodemailer";

const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASS) {
    throw new Error('❌ Faltan variables de entorno: EMAIL_USER o EMAIL_APP_PASS');
  }
  
  console.log("✅ Configuración de email validada");
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
};

const createTransporter = () => {
  validateEmailConfig();
  
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<{ success: boolean; messageId?: string }> => {
  console.log(`📨 Intentando enviar email de recuperación a: ${to}`);
  
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log("✅ Conexión con servidor SMTP verificada");
  } catch (error) {
    console.error("❌ Error de conexión SMTP:", error);
    throw new Error("No se pudo conectar con Gmail. Verifica tus credenciales.");
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña - El Gran Azul</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f8ff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f8ff;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(180deg, #003d5c 0%, #001f2f 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 63, 92, 0.3); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 50px 30px 30px 30px; background: linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);">
                  <h1 style="margin: 0; color: #00f2ff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 20px rgba(0, 242, 255, 0.4); letter-spacing: 0.5px;">
                    🦈 Restablecer Contraseña
                  </h1>
                  <div style="margin-top: 15px; height: 3px; width: 100px; background: linear-gradient(90deg, transparent, #00f2ff, transparent); margin-left: auto; margin-right: auto;"></div>
                </td>
              </tr>

              <!-- Contenido principal -->
              <tr>
                <td style="padding: 0 30px 40px 30px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(0, 62, 93, 0.4); border-radius: 12px; border: 1px solid rgba(0, 242, 255, 0.2); backdrop-filter: blur(10px);">
                    <tr>
                      <td style="padding: 30px;">
                        <p style="margin: 0 0 18px 0; color: #e0f4ff; line-height: 1.7; font-size: 16px; text-align: center;">
                          Has solicitado restablecer tu contraseña en <strong style="color: #00f2ff;">El Gran Azul</strong>
                        </p>
                        <p style="margin: 0; color: #b8dff0; line-height: 1.7; font-size: 15px; text-align: center;">
                          Haz clic en el botón below para crear una nueva contraseña. Este enlace expirará en 1 hora.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Botón de acción -->
              <tr>
                <td align="center" style="padding: 0 30px 40px 30px;">
                  <table role="presentation" style="border-collapse: collapse;">
                    <tr>
                      <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00f2ff 0%, #00b8d4 100%); box-shadow: 0 6px 25px rgba(0, 242, 255, 0.4);">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 16px 40px; color: #001f2f; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                          🔐 Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Información adicional -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(0, 45, 68, 0.6); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="margin: 0; color: #7ac5d4; font-size: 14px; line-height: 1.5;">
                          ⏰ <strong>Este enlace expira en 1 hora</strong><br>
                          🔒 Por seguridad, no compartas este email con nadie
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 30px 40px 30px; background: rgba(0, 0, 0, 0.2);">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; border-top: 1px solid rgba(0, 242, 255, 0.3); padding-top: 20px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 12px 0; color: #7ac5d4; font-size: 14px; line-height: 1.5;">
                          Si no solicitaste este cambio, puedes ignorar este email.
                        </p>
                        <p style="margin: 0 0 15px 0; color: #7ac5d4; font-size: 14px;">
                          ¿Necesitas ayuda? <a href="mailto:${process.env.EMAIL_USER}" style="color: #00f2ff; text-decoration: none; font-weight: 600;">${process.env.EMAIL_USER}</a>
                        </p>
                        <p style="margin: 0; color: #5a8a9a; font-size: 13px;">
                          © ${new Date().getFullYear()} El Gran Azul. Todos los derechos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Restablecer Contraseña - El Gran Azul

Has solicitado restablecer tu contraseña en El Gran Azul.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

⏰ Este enlace expirará en 1 hora.
🔒 Por seguridad, no compartas este email con nadie.

Si no solicitaste este cambio, puedes ignorar este email.

¿Necesitas ayuda? Contáctanos en: ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} El Gran Azul. Todos los derechos reservados.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"El Gran Azul 🌊" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🦈 Restablecer tu contraseña - El Gran Azul",
      html: htmlContent,
      text: textContent,
      replyTo: process.env.EMAIL_USER,
      headers: {
        'X-Priority': '1',
        'X-Mailer': 'El Gran Azul Mailer',
      } as Record<string, string>,
    });

    console.log(`✅ Email de recuperación enviado exitosamente a ${to}`);
    console.log(`📬 Message ID: ${info.messageId || 'N/A'}`);
    return { success: true, messageId: info.messageId || '' };
  } catch (error) {
    console.error("❌ Error enviando email de recuperación:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        throw new Error('Credenciales inválidas. Verifica EMAIL_USER y EMAIL_APP_PASS');
      }
      if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
        throw new Error('No se pudo conectar con Gmail. Verifica tu conexión a internet.');
      }
    }
    
    throw error;
  }
};

export const sendPasswordResetConfirmationEmail = async (to: string): Promise<{ success: boolean; messageId?: string }> => {
  console.log(`📨 Intentando enviar email de confirmación a: ${to}`);
  
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log("✅ Conexión con servidor SMTP verificada");
  } catch (error) {
    console.error("❌ Error de conexión SMTP:", error);
    throw new Error("No se pudo conectar con Gmail. Verifica tus credenciales.");
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contraseña Actualizada - El Gran Azul</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f8ff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f8ff;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(180deg, #003d5c 0%, #001f2f 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 63, 92, 0.3); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 50px 30px 30px 30px; background: linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, transparent 100%);">
                  <h1 style="margin: 0; color: #00ff9d; font-size: 32px; font-weight: 700; text-shadow: 0 2px 20px rgba(0, 255, 157, 0.4); letter-spacing: 0.5px;">
                    ✅ Contraseña Actualizada
                  </h1>
                  <div style="margin-top: 15px; height: 3px; width: 100px; background: linear-gradient(90deg, transparent, #00ff9d, transparent); margin-left: auto; margin-right: auto;"></div>
                </td>
              </tr>

              <!-- Contenido principal -->
              <tr>
                <td style="padding: 0 30px 40px 30px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(0, 62, 93, 0.4); border-radius: 12px; border: 1px solid rgba(0, 255, 157, 0.2); backdrop-filter: blur(10px);">
                    <tr>
                      <td style="padding: 30px;">
                        <p style="margin: 0 0 18px 0; color: #e0f4ff; line-height: 1.7; font-size: 16px; text-align: center;">
                          Tu contraseña ha sido <strong style="color: #00ff9d;">actualizada exitosamente</strong>
                        </p>
                        <p style="margin: 0; color: #b8dff0; line-height: 1.7; font-size: 15px; text-align: center;">
                          Ahora puedes iniciar sesión en tu cuenta con tu nueva contraseña.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Botón de acción -->
              <tr>
                <td align="center" style="padding: 0 30px 40px 30px;">
                  <table role="presentation" style="border-collapse: collapse;">
                    <tr>
                      <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00ff9d 0%, #00cc7a 100%); box-shadow: 0 6px 25px rgba(0, 255, 157, 0.4);">
                        <a href="${process.env.FRONTEND_URL || 'https://el-gran-azul-c2d7.vercel.app'}/login" 
                           style="display: inline-block; padding: 16px 40px; color: #001f2f; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                          🐠 Iniciar Sesión
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Información de seguridad -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background: rgba(0, 45, 68, 0.6); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="margin: 0; color: #7ac5d4; font-size: 14px; line-height: 1.5;">
                          🔒 <strong>¿No realizaste este cambio?</strong><br>
                          Por favor contacta con nosotros inmediatamente
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 30px 40px 30px; background: rgba(0, 0, 0, 0.2);">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; border-top: 1px solid rgba(0, 255, 157, 0.3); padding-top: 20px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 15px 0; color: #7ac5d4; font-size: 14px;">
                          ¿Necesitas ayuda? <a href="mailto:${process.env.EMAIL_USER}" style="color: #00ff9d; text-decoration: none; font-weight: 600;">${process.env.EMAIL_USER}</a>
                        </p>
                        <p style="margin: 0; color: #5a8a9a; font-size: 13px;">
                          © ${new Date().getFullYear()} El Gran Azul. Todos los derechos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Contraseña Actualizada - El Gran Azul

✅ Tu contraseña ha sido actualizada exitosamente.

Ahora puedes iniciar sesión en tu cuenta con tu nueva contraseña.

Accede a tu cuenta aquí: ${process.env.FRONTEND_URL || 'https://el-gran-azul-c2d7.vercel.app'}/login

🔒 ¿No realizaste este cambio?
Por favor contacta con nosotros inmediatamente.

¿Necesitas ayuda? Contáctanos en: ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} El Gran Azul. Todos los derechos reservados.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"El Gran Azul 🌊" <${process.env.EMAIL_USER}>`,
      to,
      subject: "✅ Contraseña actualizada exitosamente - El Gran Azul",
      html: htmlContent,
      text: textContent,
      replyTo: process.env.EMAIL_USER,
    });

    console.log(`✅ Email de confirmación enviado exitosamente a ${to}`);
    console.log(`📬 Message ID: ${info.messageId || 'N/A'}`);
    return { success: true, messageId: info.messageId || '' };
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error);
    throw error;
  }
};