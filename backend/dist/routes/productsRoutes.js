"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsController_1 = require("../controllers/productsController");
const router = (0, express_1.Router)();
// Trasy dla produktów
router.get('/', productsController_1.productsController.getProducts);
router.get('/:productId', productsController_1.productsController.getProductDetails);
exports.default = router;
