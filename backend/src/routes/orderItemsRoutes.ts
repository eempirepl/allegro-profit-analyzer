import express from 'express';
import orderItemsController from '../controllers/orderItemsController';

const router = express.Router();

// GET /api/order-items
router.get('/', orderItemsController.getAllOrderItems);

// GET /api/order-items/:orderId
router.get('/:orderId', orderItemsController.getOrderItems);

// POST /api/order-items/sync
router.post('/sync', orderItemsController.syncOrderItems);

export default router; 