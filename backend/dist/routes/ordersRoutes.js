"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ordersController_1 = __importDefault(require("../controllers/ordersController"));
const router = express_1.default.Router();
// GET /api/orders
router.get('/', ordersController_1.default.getOrders);
// GET /api/orders/:orderId
router.get('/:orderId', ordersController_1.default.getOrderDetails);
// POST /api/orders/sync
router.post('/sync', ordersController_1.default.syncOrders);
exports.default = router;
