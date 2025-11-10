import nodemailer from "nodemailer";

const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASS) {
    throw new Error('❌ Faltan variables de entorno: EMAIL_USER o EMAIL_APP_PASS');
  }
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
  } catch (error) {
    console.error("❌ Error de conexión SMTP:", error);
    throw new Error("No se pudo conectar con el servidor de email");
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
                <td align="center" style="padding: 40px 30px 20px 30px; background: linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%);">
                  <h1 style="margin: 0; color: #00f2ff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 20px rgba(0, 242, 255, 0.4);">
                    Restablecer Contraseña
                  </h1>
                </td>
              </tr>

              <!-- Contenido principal -->
              <tr>
                <td style="padding: 30px;">
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
                <td align="center" style="padding: 0 30px 30px 30px;">
                  <table role="presentation" style="border-collapse: collapse;">
                    <tr>
                      <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00f2ff 0%, #00b8d4 100%); box-shadow: 0 6px 25px rgba(0, 242, 255, 0.4);">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 15px 35px; color: #001f2f; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
                          🦈 Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px 30px 30px; background: rgba(0, 0, 0, 0.2);">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; border-top: 1px solid rgba(0, 242, 255, 0.3); padding-top: 20px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 12px 0; color: #7ac5d4; font-size: 14px;">
                          Si no solicitaste este cambio, puedes ignorar este email.
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

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email.

© ${new Date().getFullYear()} El Gran Azul. Todos los derechos reservados.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"El Gran Azul 🌊" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🦈 Restablecer tu contraseña - El Gran Azul",
      html: htmlContent,
      text: textContent,
    });

    console.log(`✅ Email de recuperación enviado exitosamente a ${to}`);
    return { success: true, messageId: info.messageId || '' };
  } catch (error) {
    console.error("❌ Error enviando email de recuperación:", error);
    throw error;
  }
};

export const sendPasswordResetConfirmationEmail = async (to: string): Promise<void> => {
  const transporter = createTransporter();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contraseña Actualizada - El Gran Azul</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f0f8ff; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #003d5c 0%, #001f2f 100%); color: white; padding: 30px; border-radius: 16px;">
        <h2 style="color: #00f2ff; text-align: center;">✅ Contraseña Actualizada</h2>
        <p style="text-align: center;">Tu contraseña ha sido actualizada exitosamente.</p>
        <p style="text-align: center;">Si no realizaste este cambio, por favor contacta con nosotros inmediatamente.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"El Gran Azul 🌊" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✅ Contraseña actualizada exitosamente - El Gran Azul",
    html: htmlContent,
  });
};