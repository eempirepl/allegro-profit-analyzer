"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLinkerController = void 0;
const baseLinkerService_1 = require("../services/baseLinkerService");
const logger_1 = require("../utils/logger");
// Kontroler BaseLinker
exports.baseLinkerController = {
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
            res.json({
                success: true,
                data: products
            });
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania produktów:', error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania produktów'
            });
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
            res.json({
                success: true,
                data: product
            });
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania szczegółów produktu ${req.params.productId}:`, error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania szczegółów produktu'
            });
        }
    },
    // Pobieranie listy zamówień
    async getOrders(req, res) {
        try {
            const dateFrom = req.query.dateFrom ? Number(req.query.dateFrom) : undefined;
            const dateTo = req.query.dateTo ? Number(req.query.dateTo) : undefined;
            const statusId = req.query.statusId ? Number(req.query.statusId) : undefined;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 100;
            const orders = await baseLinkerService_1.baseLinkerService.getOrders({ dateFrom, dateTo, statusId, page, limit });
            res.json({ success: true, data: orders });
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania zamówień:', error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania zamówień'
            });
        }
    },
    // Pobieranie szczegółów zamówienia
    async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'Nie podano ID zamówienia'
                });
            }
            const orderDetails = await baseLinkerService_1.baseLinkerService.getOrderDetails(orderId);
            res.json({ success: true, data: orderDetails });
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania szczegółów zamówienia ${req.params.orderId}:`, error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania szczegółów zamówienia'
            });
        }
    },
    // Pobieranie listy magazynów
    async getInventories(req, res) {
        try {
            logger_1.logger.info('Rozpoczynam pobieranie listy magazynów');
            const response = await baseLinkerService_1.baseLinkerService.getInventories();
            const inventories = response.data.inventories;
            logger_1.logger.info(`Pobrano ${inventories.length} magazynów`);
            res.json({
                success: true,
                data: inventories
            });
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania listy magazynów:', error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania listy magazynów'
            });
        }
    },
    // Pobieranie szczegółów magazynu
    async getInventoryDetails(req, res) {
        try {
            const { inventoryId } = req.params;
            if (!inventoryId) {
                const errorResponse = {
                    success: false,
                    error: 'Nie podano ID magazynu'
                };
                return res.status(400).json(errorResponse);
            }
            logger_1.logger.info('Rozpoczynam pobieranie szczegółów magazynu', { inventoryId });
            const response = await baseLinkerService_1.baseLinkerService.getInventories();
            const inventory = response.data.inventories.find((inv) => inv.inventory_id === inventoryId);
            if (!inventory) {
                const errorResponse = {
                    success: false,
                    error: 'Nie znaleziono magazynu o podanym ID'
                };
                return res.status(404).json(errorResponse);
            }
            logger_1.logger.info('Pobrano szczegóły magazynu', { inventoryId });
            res.json({
                success: true,
                data: inventory
            });
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania szczegółów magazynu ${req.params.inventoryId}:`, error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania szczegółów magazynu'
            });
        }
    }
};
