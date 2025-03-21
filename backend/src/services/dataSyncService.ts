import { baseLinkerService } from './baseLinkerService';
import { logger } from '../utils/logger';
import { prisma } from '../config/db';
import { Product, Order, OrderItem, Prisma } from '@prisma/client';
import { ProductsResponseData, OrdersResponseData, OrderDetailsResponseData } from '../types/baseLinkerTypes';

export class DataSyncService {
  // Synchronizacja produktów
  async syncProducts() {
    try {
      logger.info('Rozpoczęcie synchronizacji produktów');
      
      // Pobierz produkty z BaseLinker
      const productsResponse = await baseLinkerService.getProducts();
      const products = Object.values(productsResponse.products);
      
      // Dla każdego produktu...
      for (const product of products) {
        try {
          // Sprawdź czy produkt już istnieje (po external_id)
          const existingProduct = await prisma.product.findUnique({
            where: { externalId: String(product.product_id) }
          });
          
          const productData = {
            name: product.name,
            sku: product.sku || undefined,
            ean: product.ean || undefined,
            purchasePrice: undefined, // W nowym typie BaseLinkerProductBasic nie ma purchase_price
            externalId: String(product.product_id)
          } satisfies Prisma.ProductUpdateInput;
          
          if (existingProduct) {
            // Aktualizuj istniejący produkt
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: productData
            });
          } else {
            // Utwórz nowy produkt
            await prisma.product.create({
              data: productData
            });
          }
        } catch (error) {
          logger.error(`Błąd podczas przetwarzania produktu ${product.product_id}:`, error);
          // Kontynuuj z następnym produktem
          continue;
        }
      }
      
      logger.info('Synchronizacja produktów zakończona pomyślnie');
    } catch (error) {
      logger.error('Błąd podczas synchronizacji produktów:', error);
      throw error;
    }
  }

  // Synchronizacja zamówień
  async syncOrders(dateFrom: number, dateTo: number) {
    try {
      logger.info('Rozpoczęcie synchronizacji zamówień');
      
      // Pobierz zamówienia z BaseLinker
      const ordersResponse = await baseLinkerService.getOrders({ dateFrom, dateTo });
      const orders = ordersResponse.orders;
      
      // Dla każdego zamówienia...
      for (const order of orders) {
        try {
          // Sprawdź czy zamówienie już istnieje (po external_id)
          const existingOrder = await prisma.order.findUnique({
            where: { externalId: String(order.order_id) }
          });
          
          // Pobierz szczegóły zamówienia
          const orderDetails = await baseLinkerService.getOrderDetails(order.order_id);
          
          const orderData = {
            externalId: String(order.order_id),
            orderDate: new Date(order.date_add * 1000),
            status: order.order_status_id || undefined,
            totalAmount: Number(orderDetails.order.price) || 0
          } satisfies Prisma.OrderUpdateInput;
          
          let dbOrder: { id: number };
          if (existingOrder) {
            // Aktualizuj istniejące zamówienie
            const updatedOrder = await prisma.order.update({
              where: { id: existingOrder.id },
              data: orderData
            });
            dbOrder = { id: updatedOrder.id };

            // Usuń stare pozycje zamówienia
            try {
              const items = await prisma.orderItem.findMany({
                where: { orderId: existingOrder.id }
              });
              
              for (const item of items) {
                await prisma.orderItem.delete({
                  where: { id: item.id }
                });
              }
            } catch (error: unknown) {
              logger.error(`Błąd podczas usuwania pozycji zamówienia ${existingOrder.id}:`, error);
            }
          } else {
            // Utwórz nowe zamówienie
            const createdOrder = await prisma.order.create({
              data: orderData
            });
            dbOrder = { id: createdOrder.id };
          }
          
          // Dodaj nowe pozycje zamówienia
          for (const item of orderDetails.items) {
            const orderItemData = {
              orderId: dbOrder.id,
              quantity: Number(item.quantity),
              price: Number(item.price),
              productId: item.product_id ? parseInt(item.product_id) : undefined
            } satisfies Prisma.OrderItemUncheckedCreateInput;

            try {
              await prisma.orderItem.create({
                data: orderItemData
              });
            } catch (error: unknown) {
              logger.error(`Błąd podczas dodawania pozycji zamówienia ${dbOrder.id}:`, error);
            }
          }
        } catch (error) {
          logger.error(`Błąd podczas przetwarzania zamówienia ${order.order_id}:`, error);
          // Kontynuuj z następnym zamówieniem
          continue;
        }
      }
      
      logger.info('Synchronizacja zamówień zakończona pomyślnie');
    } catch (error) {
      logger.error('Błąd podczas synchronizacji zamówień:', error);
      throw error;
    }
  }

  // Pełna synchronizacja
  async syncAll(dateFrom: number, dateTo: number) {
    try {
      logger.info('Rozpoczęcie pełnej synchronizacji danych');
      
      await this.syncProducts();
      await this.syncOrders(dateFrom, dateTo);

      logger.info('Pełna synchronizacja zakończona pomyślnie');
    } catch (error) {
      logger.error('Błąd podczas pełnej synchronizacji:', error);
      throw error;
    }
  }
}

export const dataSyncService = new DataSyncService(); 