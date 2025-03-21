"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSyncService = void 0;
const baseLinkerService_1 = require("./baseLinkerService");
const logger_1 = require("../utils/logger");
const db_1 = require("../config/db");
class DataSyncService {
    // Synchronizacja produktów
    async syncProducts() {
        try {
            logger_1.logger.info('Rozpoczęcie synchronizacji produktów');
            const productsResponse = await baseLinkerService_1.baseLinkerService.getProducts({});
            const products = productsResponse.data.products;
            const result = {
                created: 0,
                updated: 0,
                errors: 0
            };
            for (const product of products) {
                try {
                    const existingProduct = await db_1.prisma.product.findUnique({
                        where: { externalId: String(product.id) }
                    });
                    const productData = {
                        name: product.name,
                        sku: product.sku || undefined,
                        ean: product.ean || undefined,
                        purchasePrice: product.purchase_price ? Number(product.purchase_price) : undefined,
                        externalId: String(product.id)
                    };
                    if (existingProduct) {
                        await db_1.prisma.product.update({
                            where: { id: existingProduct.id },
                            data: productData
                        });
                        result.updated++;
                    }
                    else {
                        await db_1.prisma.product.create({
                            data: {
                                ...productData,
                                name: product.name // name jest wymagane przy tworzeniu
                            }
                        });
                        result.created++;
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Błąd podczas synchronizacji produktu ${product.id}:`, error);
                    result.errors++;
                }
            }
            logger_1.logger.info(`Synchronizacja produktów zakończona. Utworzono: ${result.created}, Zaktualizowano: ${result.updated}, Błędy: ${result.errors}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas synchronizacji produktów:', error);
            throw error;
        }
    }
    // Synchronizacja zamówień
    async syncOrders(dateFrom, dateTo) {
        try {
            logger_1.logger.info('Rozpoczęcie synchronizacji zamówień');
            const orders = await baseLinkerService_1.baseLinkerService.getOrders({ dateFrom, dateTo });
            const result = {
                created: 0,
                updated: 0,
                errors: 0,
                items: {
                    created: 0,
                    updated: 0,
                    errors: 0
                }
            };
            for (const order of orders) {
                try {
                    const existingOrder = await db_1.prisma.order.findUnique({
                        where: { externalId: order.order_id }
                    });
                    const orderData = {
                        externalId: order.order_id,
                        orderDate: new Date(order.date_add * 1000),
                        status: String(order.status_id), // Konwersja na string
                        totalAmount: order.delivery_price || 0,
                        shippingCost: order.delivery_price || undefined
                    };
                    let orderId;
                    if (existingOrder) {
                        await db_1.prisma.order.update({
                            where: { id: existingOrder.id },
                            data: orderData
                        });
                        orderId = existingOrder.id;
                        result.updated++;
                    }
                    else {
                        const newOrder = await db_1.prisma.order.create({
                            data: orderData
                        });
                        orderId = newOrder.id;
                        result.created++;
                    }
                    // Synchronizacja pozycji zamówienia
                    const orderItems = await baseLinkerService_1.baseLinkerService.getOrderItems(order.order_id);
                    for (const item of orderItems) {
                        try {
                            const existingItems = await db_1.prisma.orderItem.findMany({
                                where: {
                                    orderId,
                                    externalId: item.product_id
                                },
                                take: 1
                            });
                            const itemData = {
                                orderId,
                                externalId: item.product_id,
                                quantity: item.quantity,
                                price: item.price_brutto
                            };
                            if (existingItems.length > 0) {
                                await db_1.prisma.orderItem.update({
                                    where: { id: existingItems[0].id },
                                    data: itemData
                                });
                                result.items.updated++;
                            }
                            else {
                                await db_1.prisma.orderItem.create({
                                    data: itemData
                                });
                                result.items.created++;
                            }
                        }
                        catch (error) {
                            logger_1.logger.error(`Błąd podczas synchronizacji pozycji zamówienia ${order.order_id}:`, error);
                            result.items.errors++;
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Błąd podczas synchronizacji zamówienia ${order.order_id}:`, error);
                    result.errors++;
                }
            }
            logger_1.logger.info(`Synchronizacja zamówień zakończona. Zamówienia - Utworzono: ${result.created}, Zaktualizowano: ${result.updated}, Błędy: ${result.errors}. Pozycje - Utworzono: ${result.items.created}, Zaktualizowano: ${result.items.updated}, Błędy: ${result.items.errors}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas synchronizacji zamówień:', error);
            throw error;
        }
    }
    // Pełna synchronizacja
    async syncAll(dateFrom, dateTo) {
        try {
            logger_1.logger.info('Rozpoczęcie pełnej synchronizacji danych');
            const productsResult = await this.syncProducts();
            const ordersResult = await this.syncOrders(dateFrom, dateTo);
            return {
                products: productsResult,
                orders: ordersResult
            };
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pełnej synchronizacji:', error);
            throw error;
        }
    }
}
exports.dataSyncService = new DataSyncService();
