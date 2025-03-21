"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSyncService = exports.DataSyncService = void 0;
const baseLinkerService_1 = require("./baseLinkerService");
const logger_1 = require("../utils/logger");
const db_1 = require("../config/db");
class DataSyncService {
    // Synchronizacja produktów
    async syncProducts() {
        try {
            logger_1.logger.info('Rozpoczęcie synchronizacji produktów');
            const inventoryId = process.env.BASELINKER_INVENTORY_ID || '';
            if (!inventoryId) {
                throw new Error('Nie skonfigurowano BASELINKER_INVENTORY_ID');
            }
            // Pobierz produkty z BaseLinker
            const productsResponse = await baseLinkerService_1.baseLinkerService.getProducts({
                inventory_id: inventoryId
            });
            const products = Object.values(productsResponse.data.products || {});
            // Pobierz szczegóły produktów
            const productIds = products.map(p => Number(p.id));
            const productDetails = await baseLinkerService_1.baseLinkerService.getProductDetails({
                inventory_id: inventoryId,
                products: productIds
            });
            // Dla każdego produktu...
            for (const product of products) {
                try {
                    const productDetail = productDetails.data.products[product.id];
                    // Sprawdź czy produkt już istnieje (po external_id)
                    const existingProduct = await db_1.prisma.product.findUnique({
                        where: { externalId: String(product.id) }
                    });
                    const productData = {
                        name: product.name,
                        sku: product.sku || undefined,
                        ean: product.ean || undefined,
                        purchasePrice: productDetail?.average_cost ? Number(productDetail.average_cost) : undefined,
                        externalId: String(product.id)
                    };
                    if (existingProduct) {
                        // Aktualizuj istniejący produkt
                        await db_1.prisma.product.update({
                            where: { id: existingProduct.id },
                            data: productData
                        });
                    }
                    else {
                        // Utwórz nowy produkt
                        await db_1.prisma.product.create({
                            data: productData
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Błąd podczas przetwarzania produktu ${product.id}:`, error);
                    // Kontynuuj z następnym produktem
                    continue;
                }
            }
            logger_1.logger.info('Synchronizacja produktów zakończona pomyślnie');
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
            // Pobierz zamówienia z BaseLinker
            const ordersResponse = await baseLinkerService_1.baseLinkerService.getOrders({ dateFrom, dateTo });
            const orders = ordersResponse.data.orders;
            // Dla każdego zamówienia...
            for (const order of orders) {
                try {
                    // Sprawdź czy zamówienie już istnieje (po external_id)
                    const existingOrder = await db_1.prisma.order.findUnique({
                        where: { externalId: String(order.order_id) }
                    });
                    // Pobierz szczegóły zamówienia
                    const orderDetails = await baseLinkerService_1.baseLinkerService.getOrderDetails(order.order_id);
                    const orderData = {
                        externalId: String(order.order_id),
                        orderDate: new Date(order.date_add * 1000),
                        status: order.status_id ? String(order.status_id) : undefined,
                        totalAmount: Number(order.delivery_price) || 0
                    };
                    let dbOrder;
                    if (existingOrder) {
                        // Aktualizuj istniejące zamówienie
                        const updatedOrder = await db_1.prisma.order.update({
                            where: { id: existingOrder.id },
                            data: orderData
                        });
                        dbOrder = { id: updatedOrder.id };
                        // Usuń stare pozycje zamówienia
                        try {
                            const items = await db_1.prisma.orderItem.findMany({
                                where: { orderId: existingOrder.id }
                            });
                            for (const item of items) {
                                await db_1.prisma.orderItem.delete({
                                    where: { id: item.id }
                                });
                            }
                        }
                        catch (error) {
                            logger_1.logger.error(`Błąd podczas usuwania pozycji zamówienia ${existingOrder.id}:`, error);
                        }
                    }
                    else {
                        // Utwórz nowe zamówienie
                        const createdOrder = await db_1.prisma.order.create({
                            data: orderData
                        });
                        dbOrder = { id: createdOrder.id };
                    }
                    // Dodaj nowe pozycje zamówienia
                    for (const item of orderDetails.data.items) {
                        const orderItemData = {
                            orderId: dbOrder.id,
                            quantity: Number(item.quantity),
                            price: Number(item.price_brutto),
                            productId: item.product_id ? parseInt(item.product_id) : undefined
                        };
                        try {
                            await db_1.prisma.orderItem.create({
                                data: orderItemData
                            });
                        }
                        catch (error) {
                            logger_1.logger.error(`Błąd podczas dodawania pozycji zamówienia ${dbOrder.id}:`, error);
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Błąd podczas przetwarzania zamówienia ${order.order_id}:`, error);
                    // Kontynuuj z następnym zamówieniem
                    continue;
                }
            }
            logger_1.logger.info('Synchronizacja zamówień zakończona pomyślnie');
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
            await this.syncProducts();
            await this.syncOrders(dateFrom, dateTo);
            logger_1.logger.info('Pełna synchronizacja zakończona pomyślnie');
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pełnej synchronizacji:', error);
            throw error;
        }
    }
}
exports.DataSyncService = DataSyncService;
exports.dataSyncService = new DataSyncService();
