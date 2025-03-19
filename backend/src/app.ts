import express from 'express';
import cors from 'cors';
import productsRoutes from './routes/productsRoutes';
import ordersRoutes from './routes/ordersRoutes';
import orderItemsRoutes from './routes/orderItemsRoutes';
import dotenv from 'dotenv';

// Wczytanie zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API działa poprawnie' });
});

// Routing API
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/order-items', orderItemsRoutes);

// Uruchamianie serwera
const server = app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`);
});

export default app; 