"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsController = void 0;
const baseLinkerService_1 = require("../services/baseLinkerService");
const logger_1 = require("../utils/logger");
exports.productsController = {
    // Pobieranie listy produktów
    async getProducts(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const inventoryId = req.query.inventoryId;
            if (!inventoryId) {
                const errorResponse = {
                    success: false,
                    error: 'Nie podano ID magazynu'
                };
                return res.status(400).json(errorResponse);
            }
            logger_1.logger.info('Rozpoczynam pobieranie listy produktów', { page, inventoryId });
            const response = await baseLinkerService_1.baseLinkerService.getProducts({
                inventory_id: inventoryId,
                page
            });
            const products = Object.values(response.data.products);
            logger_1.logger.info(`Pobrano ${products.length} produktów`);
            const apiResponse = {
                success: true,
                data: products,
                pagination: {
                    page,
                    limit: 1000, // BaseLinker zwraca maksymalnie 1000 produktów na stronę
                    total: products.length
                }
            };
            res.json(apiResponse);
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania produktów:', error);
            const errorResponse = {
                success: false,
                error: 'Wystąpił błąd podczas pobierania produktów'
            };
            res.status(500).json(errorResponse);
        }
    },
    // Pobieranie szczegółów produktu
    async getProductDetails(req, res) {
        try {
            const { productId } = req.params;
            const inventoryId = req.query.inventoryId;
            if (!productId || !inventoryId) {
                const errorResponse = {
                    success: false,
                    error: 'Nie podano ID produktu lub magazynu'
                };
                return res.status(400).json(errorResponse);
            }
            logger_1.logger.info('Rozpoczynam pobieranie szczegółów produktu', { productId, inventoryId });
            const response = await baseLinkerService_1.baseLinkerService.getProductDetails({
                inventory_id: inventoryId,
                products: [Number(productId)]
            });
            const product = response.data.products[productId];
            if (!product) {
                const errorResponse = {
                    success: false,
                    error: 'Nie znaleziono produktu o podanym ID'
                };
                return res.status(404).json(errorResponse);
            }
            logger_1.logger.info('Pobrano szczegóły produktu', { productId });
            const apiResponse = {
                success: true,
                data: product
            };
            res.json(apiResponse);
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania szczegółów produktu ${req.params.productId}:`, error);
            const errorResponse = {
                success: false,
                error: 'Wystąpił błąd podczas pobierania szczegółów produktu'
            };
            res.status(500).json(errorResponse);
        }
    }
};
