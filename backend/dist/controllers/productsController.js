"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProducts = exports.getProducts = void 0;
const logger_1 = require("../utils/logger");
const baseLinkerService_1 = __importDefault(require("../services/baseLinkerService"));
/**
 * Pobiera wszystkie produkty magazynowe
 */
const getProducts = async (req, res) => {
    try {
        // Pobieramy ID magazynu z zapytania lub używamy domyślnego
        // Prawdopodobnie ID 33644 nie jest poprawne, możemy użyć 0 do pobierania ze wszystkich magazynów
        const inventoryId = req.query.inventory_id || '0';
        logger_1.logger.info(`Pobieranie produktów magazynowych z inventoryId=${inventoryId}`);
        // Pobieranie wszystkich produktów z obsługą paginacji
        const productsData = await baseLinkerService_1.default.getAllInventoryProducts(inventoryId);
        // Mapowanie danych produktów do formatu oczekiwanego przez frontend
        const products = Object.entries(productsData.products || {}).map(([productId, product]) => {
            return {
                id: parseInt(productId),
                sku: product.sku || '',
                ean: product.ean || '',
                name: product.text_fields?.name || '',
                average_cost: product.average_cost || null,
                stock: baseLinkerService_1.default.calculateTotalStock(product),
            };
        });
        logger_1.logger.info(`Pobrano ${products.length} produktów magazynowych`);
        res.status(200).json({
            success: true,
            count: products.length,
            products: products
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania produktów magazynowych: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania produktów magazynowych',
            details: error.message || String(error)
        });
    }
};
exports.getProducts = getProducts;
/**
 * Synchronizuje produkty magazynowe z BaseLinker
 */
const syncProducts = async (req, res) => {
    try {
        // Pobieramy ID magazynu z zapytania lub używamy domyślnego
        // Prawdopodobnie ID 33644 nie jest poprawne, możemy użyć 0 do pobierania ze wszystkich magazynów
        const inventoryId = req.query.inventory_id || '0';
        logger_1.logger.info(`Rozpoczęcie synchronizacji produktów magazynowych z inventoryId=${inventoryId}`);
        // Pobieranie wszystkich produktów
        const productsData = await baseLinkerService_1.default.getAllInventoryProducts(inventoryId);
        // Mapowanie danych produktów
        const products = Object.entries(productsData.products || {}).map(([productId, product]) => {
            return {
                id: parseInt(productId),
                sku: product.sku || '',
                ean: product.ean || '',
                name: product.text_fields?.name || '',
                average_cost: product.average_cost || null,
                stock: baseLinkerService_1.default.calculateTotalStock(product),
            };
        });
        logger_1.logger.info(`Zsynchronizowano ${products.length} produktów magazynowych`);
        res.status(200).json({
            success: true,
            message: `Zsynchronizowano ${products.length} produktów magazynowych`,
            count: products.length,
            products: products
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas synchronizacji produktów magazynowych: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas synchronizacji produktów magazynowych',
            details: error.message || String(error)
        });
    }
};
exports.syncProducts = syncProducts;
exports.default = {
    getProducts: exports.getProducts,
    syncProducts: exports.syncProducts
};
