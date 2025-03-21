import { Router } from 'express';
import { syncController } from '../controllers/syncController';

const router = Router();

// Synchronizacja produktów
router.get('/products', syncController.syncProducts);

// Synchronizacja zamówień
router.get('/orders', syncController.syncOrders);

// Pełna synchronizacja
router.get('/all', syncController.syncAll);

export default router; 