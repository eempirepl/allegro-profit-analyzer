import express from 'express';
import baselinkerController from '../controllers/baselinkerController';

const router = express.Router();

// Trasy dla produktów
router.get('/products', baselinkerController.getProducts);
router.get('/products/:productId', baselinkerController.getProductDetails);

// Trasy dla zamówień
router.get('/orders', baselinkerController.getOrders);
router.get('/orders/:orderId', baselinkerController.getOrderDetails);
router.get('/orders/:orderId/items', baselinkerController.getOrderItems);

// Trasa do synchronizacji danych
router.get('/sync', baselinkerController.syncData);

export default router; 