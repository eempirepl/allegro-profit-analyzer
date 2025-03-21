"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const syncController_1 = require("../controllers/syncController");
const router = (0, express_1.Router)();
// Synchronizacja produktów
router.get('/products', syncController_1.syncController.syncProducts);
// Synchronizacja zamówień
router.get('/orders', syncController_1.syncController.syncOrders);
// Pełna synchronizacja
router.get('/all', syncController_1.syncController.syncAll);
exports.default = router;
