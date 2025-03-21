"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
// Pobierz wszystkie zamówienia
router.get('/', orderController_1.getOrders);
// Pobierz zamówienie według ID
router.get('/:id', orderController_1.getOrderById);
// Utwórz nowe zamówienie
router.post('/', orderController_1.createOrder);
// Zaktualizuj zamówienie
router.put('/:id', orderController_1.updateOrder);
// Usuń zamówienie
router.delete('/:id', orderController_1.deleteOrder);
// Pobierz rentowność zamówienia
router.get('/:id/profitability', orderController_1.getOrderProfitability);
exports.orderRoutes = router;
