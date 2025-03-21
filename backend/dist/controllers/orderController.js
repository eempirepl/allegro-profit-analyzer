"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderProfitability = exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
// Pobierz wszystkie zamówienia
const getOrders = async (req, res) => {
    try {
        const orders = await db_1.prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: {
                orderDate: 'desc'
            }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas pobierania zamówień:', error);
        res.status(500).json({ message: 'Nie udało się pobrać zamówień' });
    }
};
exports.getOrders = getOrders;
// Pobierz zamówienie po ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db_1.prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!order) {
            res.status(404).json({ message: 'Zamówienie nie zostało znalezione' });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania zamówienia o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się pobrać zamówienia' });
    }
};
exports.getOrderById = getOrderById;
// Utwórz nowe zamówienie
const createOrder = async (req, res) => {
    try {
        const { externalId, orderNumber, status, orderDate, shippingCost, discountAmount, totalAmount, customer_id, items } = req.body;
        const order = await db_1.prisma.order.create({
            data: {
                externalId,
                orderNumber,
                status,
                orderDate: new Date(orderDate),
                shippingCost,
                discountAmount,
                totalAmount,
                customer_id,
                items: {
                    create: items.map((item) => ({
                        quantity: item.quantity,
                        price: item.price,
                        externalId: item.externalId,
                        productId: item.productId,
                        purchasePrice: item.purchasePrice
                    }))
                }
            },
            include: {
                items: true
            }
        });
        res.status(201).json(order);
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas tworzenia zamówienia:', error);
        res.status(500).json({ message: 'Nie udało się utworzyć zamówienia' });
    }
};
exports.createOrder = createOrder;
// Zaktualizuj zamówienie
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { externalId, orderNumber, status, orderDate, shippingCost, discountAmount, totalAmount, customer_id } = req.body;
        const order = await db_1.prisma.order.update({
            where: { id: Number(id) },
            data: {
                externalId,
                orderNumber,
                status,
                orderDate: orderDate ? new Date(orderDate) : undefined,
                shippingCost,
                discountAmount,
                totalAmount,
                customer_id
            }
        });
        res.status(200).json(order);
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas aktualizacji zamówienia o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się zaktualizować zamówienia' });
    }
};
exports.updateOrder = updateOrder;
// Usuń zamówienie
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.order.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas usuwania zamówienia o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się usunąć zamówienia' });
    }
};
exports.deleteOrder = deleteOrder;
// Pobierz rentowność zamówienia
const getOrderProfitability = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db_1.prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!order) {
            res.status(404).json({ message: 'Zamówienie nie zostało znalezione' });
            return;
        }
        // Obliczanie kosztów produktów
        let productCost = 0;
        for (const item of order.items) {
            const purchasePrice = item.purchasePrice || item.product?.purchasePrice || 0;
            productCost += purchasePrice * item.quantity;
        }
        // Obliczanie zysku
        const revenue = order.totalAmount;
        const shippingCost = order.shippingCost || 0;
        const allegro_fee = order.allegro_fee || 0;
        const payment_fee = order.payment_fee || 0;
        const shipping_fee = order.shipping_fee || 0;
        const totalExpenses = productCost + allegro_fee + payment_fee + shipping_fee;
        const profit = revenue - totalExpenses;
        const profitMargin = (profit / revenue) * 100;
        res.status(200).json({
            orderId: order.id,
            revenue,
            expenses: {
                productCost,
                allegro_fee,
                payment_fee,
                shipping_fee,
                totalExpenses
            },
            profit,
            profitMargin: Math.round(profitMargin * 100) / 100, // zaokrąglenie do 2 miejsc po przecinku
            shippingCost
        });
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania rentowności zamówienia o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się pobrać rentowności zamówienia' });
    }
};
exports.getOrderProfitability = getOrderProfitability;
