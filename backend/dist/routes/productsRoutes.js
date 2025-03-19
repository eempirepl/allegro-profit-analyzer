"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productsController_1 = __importDefault(require("../controllers/productsController"));
const router = express_1.default.Router();
// GET /api/products
router.get('/', productsController_1.default.getProducts);
// POST /api/products/sync
router.post('/sync', productsController_1.default.syncProducts);
exports.default = router;
