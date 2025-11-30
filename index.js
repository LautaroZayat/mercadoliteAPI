// index.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { client } from './db.js';
import userRoutes from './routes/user.routes.js';
import historialRoutes from './routes/historial.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba de DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW() as now');
    res.json({ conectado: true, now: result.rows[0].now });
  } catch (e) {
    console.error('DB error:', e);
    res.status(500).json({ conectado: false, error: e.message });
  }
});

// Rutas principales
app.use('/user', userRoutes);
app.use('/historial', historialRoutes);

app.get('/', (req, res) => {
  res.send('MercadoLiteAPI funcionando correctamente!');
});

// 🔹 Sólo levanta el server en local
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 API escuchando en http://localhost:${PORT}`);
  });
}

// 🔹 Exporta la app para que Vercel la use
export default app;