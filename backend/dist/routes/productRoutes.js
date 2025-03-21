"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// Pobierz wszystkie produkty
router.get('/', productController_1.getProducts);
// Pobierz jeden produkt według ID
router.get('/:id', productController_1.getProductById);
// Utwórz nowy produkt
router.post('/', productController_1.createProduct);
// Zaktualizuj produkt
router.put('/:id', productController_1.updateProduct);
// Usuń produkt
router.delete('/:id', productController_1.deleteProduct);
// Synchronizuj produkty z BaseLinker
router.post('/sync', productController_1.syncProducts);
exports.productRoutes = router;
