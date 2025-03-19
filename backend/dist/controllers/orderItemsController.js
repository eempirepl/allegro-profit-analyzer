"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOrderItems = exports.getAllOrderItems = exports.getOrderItems = void 0;
const logger_1 = require("../utils/logger");
const baseLinkerService_1 = __importDefault(require("../services/baseLinkerService"));
/**
 * Pobiera pozycje zamówienia
 */
const getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Nie podano ID zamówienia'
            });
        }
        logger_1.logger.info(`Pobieranie pozycji zamówienia: orderId=${orderId}`);
        // Pobieranie szczegółów zamówienia
        const orderData = await baseLinkerService_1.default.getOrderDetails(orderId);
        // Pobierz kursy walut
        const exchangeRates = await baseLinkerService_1.default.getExchangeRates();
        // Mapuj pozycje zamówienia
        const currency = orderData.order_currency || 'PLN';
        const rate = exchangeRates[currency] || 1.0;
        const orderItems = (orderData.products || []).map((product) => {
            const price = parseFloat(product.price_brutto) || 0;
            const quantity = parseInt(product.quantity) || 0;
            const totalPrice = price * quantity;
            const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
            return {
                order_id: orderId,
                product_id: product.product_id,
                name: product.name,
                price_brutto: price.toFixed(2),
                tax_rate: product.tax_rate,
                quantity: quantity,
                currency: currency,
                value_in_pln: valueInPLN.toFixed(2),
                auction_id: product.auction_id || ''
            };
        });
        logger_1.logger.info(`Pobrano ${orderItems.length} pozycji zamówienia ${orderId}`);
        res.status(200).json({
            success: true,
            count: orderItems.length,
            order_items: orderItems
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania pozycji zamówienia: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania pozycji zamówienia',
            details: error.message || String(error)
        });
    }
};
exports.getOrderItems = getOrderItems;
/**
 * Pobiera wszystkie pozycje zamówień
 */
const getAllOrderItems = async (req, res) => {
    try {
        // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
        const dateFrom = parseInt(req.query.date_from) || 0; // od początku czasu (1970-01-01)
        const dateTo = parseInt(req.query.date_to) || Math.floor(Date.now() / 1000);
        logger_1.logger.info(`Pobieranie wszystkich pozycji zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}`);
        // Pobieranie zamówień
        const ordersData = await baseLinkerService_1.default.getOrders(dateFrom, dateTo);
        // Pobierz kursy walut
        const exchangeRates = await baseLinkerService_1.default.getExchangeRates();
        // Kolekcja wszystkich pozycji zamówień
        let allOrderItems = [];
        // Dla każdego zamówienia pobierz szczegóły i wyodrębnij pozycje
        for (const order of ordersData.orders || []) {
            try {
                const orderDetails = await baseLinkerService_1.default.getOrderDetails(order.order_id);
                const currency = orderDetails.order_currency || 'PLN';
                const rate = exchangeRates[currency] || 1.0;
                const orderItems = (orderDetails.products || []).map((product) => {
                    const price = parseFloat(product.price_brutto) || 0;
                    const quantity = parseInt(product.quantity) || 0;
                    const totalPrice = price * quantity;
                    const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
                    return {
                        order_id: order.order_id,
                        product_id: product.product_id,
                        name: product.name,
                        price_brutto: price.toFixed(2),
                        tax_rate: product.tax_rate,
                        quantity: quantity,
                        currency: currency,
                        value_in_pln: valueInPLN.toFixed(2),
                        auction_id: product.auction_id || ''
                    };
                });
                allOrderItems = [...allOrderItems, ...orderItems];
            }
            catch (error) {
                logger_1.logger.error(`Błąd podczas pobierania szczegółów zamówienia ${order.order_id}: ${error.message || error}`);
                // Kontynuuj mimo błędu
            }
        }
        logger_1.logger.info(`Pobrano łącznie ${allOrderItems.length} pozycji zamówień`);
        res.status(200).json({
            success: true,
            count: allOrderItems.length,
            order_items: allOrderItems
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania wszystkich pozycji zamówień: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas pobierania wszystkich pozycji zamówień',
            details: error.message || String(error)
        });
    }
};
exports.getAllOrderItems = getAllOrderItems;
/**
 * Synchronizuje pozycje zamówień z BaseLinker
 */
const syncOrderItems = async (req, res) => {
    try {
        // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
        const dateFrom = parseInt(req.query.date_from) || 0; // od początku czasu (1970-01-01)
        const dateTo = parseInt(req.query.date_to) || Math.floor(Date.now() / 1000);
        logger_1.logger.info(`Rozpoczęcie synchronizacji pozycji zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}`);
        // Pobieranie zamówień
        const ordersData = await baseLinkerService_1.default.getOrders(dateFrom, dateTo);
        // Pobierz kursy walut
        const exchangeRates = await baseLinkerService_1.default.getExchangeRates();
        // Kolekcja wszystkich pozycji zamówień
        let allOrderItems = [];
        // Dla każdego zamówienia pobierz szczegóły i wyodrębnij pozycje
        for (const order of ordersData.orders || []) {
            try {
                const orderDetails = await baseLinkerService_1.default.getOrderDetails(order.order_id);
                const currency = orderDetails.order_currency || 'PLN';
                const rate = exchangeRates[currency] || 1.0;
                const orderItems = (orderDetails.products || []).map((product) => {
                    const price = parseFloat(product.price_brutto) || 0;
                    const quantity = parseInt(product.quantity) || 0;
                    const totalPrice = price * quantity;
                    const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
                    return {
                        order_id: order.order_id,
                        product_id: product.product_id,
                        name: product.name,
                        price_brutto: price.toFixed(2),
                        tax_rate: product.tax_rate,
                        quantity: quantity,
                        currency: currency,
                        value_in_pln: valueInPLN.toFixed(2),
                        auction_id: product.auction_id || ''
                    };
                });
                allOrderItems = [...allOrderItems, ...orderItems];
            }
            catch (error) {
                logger_1.logger.error(`Błąd podczas pobierania szczegółów zamówienia ${order.order_id}: ${error.message || error}`);
                // Kontynuuj mimo błędu
            }
        }
        logger_1.logger.info(`Zsynchronizowano łącznie ${allOrderItems.length} pozycji zamówień`);
        res.status(200).json({
            success: true,
            message: `Zsynchronizowano ${allOrderItems.length} pozycji zamówień`,
            count: allOrderItems.length,
            order_items: allOrderItems
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas synchronizacji pozycji zamówień: ${error.message || error}`);
        res.status(500).json({
            success: false,
            error: 'Błąd podczas synchronizacji pozycji zamówień',
            details: error.message || String(error)
        });
    }
};
exports.syncOrderItems = syncOrderItems;
exports.default = {
    getOrderItems: exports.getOrderItems,
    getAllOrderItems: exports.getAllOrderItems,
    syncOrderItems: exports.syncOrderItems
};
