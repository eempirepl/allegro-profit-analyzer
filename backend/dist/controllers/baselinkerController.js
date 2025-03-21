"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLinkerController = void 0;
const baseLinkerService_1 = require("../services/baseLinkerService");
const logger_1 = require("../utils/logger");
exports.baseLinkerController = {
    // Pobieranie listy produktów
    async getProducts(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 100;
            const inventoryId = req.query.inventoryId;
            const products = await baseLinkerService_1.baseLinkerService.getProducts({ page, limit, inventoryId });
            res.json({ success: true, data: products });
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
            if (!productId) {
                return res.status(400).json({
                    success: false,
                    error: 'Nie podano ID produktu'
                });
            }
            const product = await baseLinkerService_1.baseLinkerService.getProductDetails(productId, inventoryId);
            res.json({ success: true, data: product });
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
    // Pobieranie pozycji zamówienia
    async getOrderItems(req, res) {
        try {
            const { orderId } = req.params;
            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'Nie podano ID zamówienia'
                });
            }
            const items = await baseLinkerService_1.baseLinkerService.getOrderItems(orderId);
            res.json({ success: true, data: items });
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania pozycji zamówienia ${req.params.orderId}:`, error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas pobierania pozycji zamówienia'
            });
        }
    },
    // Synchronizacja danych
    async syncData(req, res) {
        try {
            const dateFrom = req.query.dateFrom ? Number(req.query.dateFrom) : Math.floor(Date.now() / 1000) - 86400 * 30; // domyślnie ostatnie 30 dni
            const dateTo = req.query.dateTo ? Number(req.query.dateTo) : Math.floor(Date.now() / 1000);
            // Inicjujemy odpowiedź jako odpowiedź strumieniową
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // Informujemy o rozpoczęciu synchronizacji
            res.write(`data: ${JSON.stringify({ status: 'start', message: 'Rozpoczęcie synchronizacji danych z BaseLinker' })}\n\n`);
            // Wykonujemy synchronizację
            const syncResult = await baseLinkerService_1.baseLinkerService.syncData(dateFrom, dateTo);
            // Informujemy o zakończeniu synchronizacji
            res.write(`data: ${JSON.stringify({
                status: 'complete',
                message: 'Synchronizacja danych z BaseLinker zakończona pomyślnie',
                stats: {
                    products: syncResult.products.length,
                    orders: syncResult.orders.length,
                    orderItems: syncResult.orderItems.length
                }
            })}\n\n`);
            res.end();
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas synchronizacji danych:', error);
            // W przypadku błędu również informujemy klienta
            res.write(`data: ${JSON.stringify({
                status: 'error',
                message: 'Błąd podczas synchronizacji danych z BaseLinker',
                error: error instanceof Error ? error.message : 'Nieznany błąd'
            })}\n\n`);
            res.end();
        }
    },
    // Test połączenia
    async testConnection(req, res) {
        try {
            const isConnected = await baseLinkerService_1.baseLinkerService.testConnection();
            if (isConnected) {
                res.json({ success: true, message: 'Połączenie z BaseLinker API działa poprawnie' });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Nie można połączyć się z BaseLinker API'
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas testowania połączenia:', error);
            res.status(500).json({
                success: false,
                error: 'Wystąpił błąd podczas testowania połączenia'
            });
        }
    }
};
