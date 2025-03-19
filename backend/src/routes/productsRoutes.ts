import express from 'express';
import productsController from '../controllers/productsController';

const router = express.Router();

// GET /api/products
router.get('/', productsController.getProducts);

// POST /api/products/sync
router.post('/sync', productsController.syncProducts);

export default router; 