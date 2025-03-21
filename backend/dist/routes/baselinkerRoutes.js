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
// Magazyny
router.get('/inventories', baselinkerController_1.baseLinkerController.getInventories);
router.get('/inventories/:inventoryId', baselinkerController_1.baseLinkerController.getInventoryDetails);
exports.default = router;
