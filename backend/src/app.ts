import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { productRoutes } from './routes/productRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { baselinkerRoutes } from './routes/baselinkerRoutes';
import { allegroRoutes } from './routes/allegroRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

// Ładowanie zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logowanie żądań
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Trasy
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/baselinker', baselinkerRoutes);
app.use('/api/allegro', allegroRoutes);

// Obsługa błędów
app.use(errorHandler);

// Uruchamianie serwera
app.listen(PORT, () => {
  logger.info(`Serwer działa na porcie: ${PORT}`);
});

export default app; 