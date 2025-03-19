"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderItemsController_1 = __importDefault(require("../controllers/orderItemsController"));
const router = express_1.default.Router();
// GET /api/order-items
router.get('/', orderItemsController_1.default.getAllOrderItems);
// GET /api/order-items/:orderId
router.get('/:orderId', orderItemsController_1.default.getOrderItems);
// POST /api/order-items/sync
router.post('/sync', orderItemsController_1.default.syncOrderItems);
exports.default = router;
