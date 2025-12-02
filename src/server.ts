import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 Variables de entorno cargadas');
console.log('🔧 Puerto:', process.env.APP_PORT || 4000);
console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);

import { app } from "./app";
import db_connection from "./database/db_connection";

const APP_PORT = Number(process.env.APP_PORT) || 4000;

const startServer = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await db_connection.authenticate(); // Usa authenticate en lugar de sync
    console.log('✅ Conexión a BD establecida');
    
    // Opcional: sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await db_connection.sync();
      console.log('✅ Modelos sincronizados');
    }

    app.listen(APP_PORT, () => {
      console.log(`🚀 Servidor ejecutándose en: http://localhost:${APP_PORT}`);
      console.log(`🌐 Health check: http://localhost:${APP_PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();