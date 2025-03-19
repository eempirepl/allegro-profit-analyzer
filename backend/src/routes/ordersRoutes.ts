import express from 'express';
import ordersController from '../controllers/ordersController';

const router = express.Router();

// GET /api/orders
router.get('/', ordersController.getOrders);

// GET /api/orders/:orderId
router.get('/:orderId', ordersController.getOrderDetails);

// POST /api/orders/sync
router.post('/sync', ordersController.syncOrders);

export default router; 