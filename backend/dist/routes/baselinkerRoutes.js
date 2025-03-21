"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baselinkerController_1 = require("../controllers/baselinkerController");
const router = (0, express_1.Router)();
// Produkty
router.get('/products', baselinkerController_1.baseLinkerController.getProducts);
router.get('/products/:productId', baselinkerController_1.baseLinkerController.getProductDetails);
// Zamówienia
router.get('/orders', baselinkerController_1.baseLinkerController.getOrders);
router.get('/orders/:orderId', baselinkerController_1.baseLinkerController.getOrderDetails);
router.get('/orders/:orderId/items', baselinkerController_1.baseLinkerController.getOrderItems);
// Synchronizacja i diagnostyka
router.get('/sync', baselinkerController_1.baseLinkerController.syncData);
router.get('/test-connection', baselinkerController_1.baseLinkerController.testConnection);
exports.default = router;
