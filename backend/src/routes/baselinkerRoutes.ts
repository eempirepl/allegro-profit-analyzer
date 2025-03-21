import { Router } from 'express';
import { baseLinkerController } from '../controllers/baselinkerController';

const router = Router();

// Produkty
router.get('/products', baseLinkerController.getProducts);
router.get('/products/:productId', baseLinkerController.getProductDetails);

// Zamówienia
router.get('/orders', baseLinkerController.getOrders);
router.get('/orders/:orderId', baseLinkerController.getOrderDetails);
router.get('/orders/:orderId/items', baseLinkerController.getOrderItems);

// Synchronizacja i diagnostyka
router.get('/sync', baseLinkerController.syncData);
router.get('/test-connection', baseLinkerController.testConnection);

export default router; 