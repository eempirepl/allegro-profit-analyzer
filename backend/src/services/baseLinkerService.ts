import axios from 'axios';
import Bottleneck from 'bottleneck';
import { logger } from '../utils/logger';
import config from '../config/db';

// Konfiguracja limitera zapytań do BaseLinker API (100 zapytań na minutę)
const limiter = new Bottleneck({
  minTime: 600, // minimalny czas między zapytaniami (ms) - 600ms = 100 zapytań na minutę
  maxConcurrent: 1, // maksymalna liczba jednoczesnych zapytań
});

// Konfiguracja klienta axios dla BaseLinker API
const baseLinkerClient = axios.create({
  baseURL: 'https://api.baselinker.com/connector.php',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Typy dla obsługi błędów
interface BaseLinkerError {
  message: string;
  code?: string;
  status?: number;
}

// Funkcja pomocnicza do wykonania zapytania do BaseLinker z zastosowaniem limitera
const makeBaseLinkerRequest = async (method: string, parameters: Record<string, any> = {}) => {
  try {
    // Użycie limitera do ograniczenia liczby zapytań
    return await limiter.schedule(() => {
      logger.info(`Wywołanie BaseLinker API: ${method}`);
      
      const params = new URLSearchParams();
      params.append('token', config.baseLinkerToken);
      params.append('method', method);
      
      if (Object.keys(parameters).length > 0) {
        params.append('parameters', JSON.stringify(parameters));
      }
      
      return baseLinkerClient.post('', params);
    });
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas wywołania BaseLinker API (${method}): ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera listę produktów z magazynu BaseLinker
 * @param inventoryId ID magazynu (opcjonalne)
 * @param page Numer strony wyników (opcjonalne)
 * @param limit Limit wyników na stronę (opcjonalne)
 */
export const getProducts = async (inventoryId?: string, page = 1, limit = 100) => {
  try {
    const parameters = {
      inventory_id: inventoryId || '',
      filter_category_id: 0,
      filter_ean: '',
      filter_sku: '',
      filter_name: '',
      filter_price_from: 0,
      filter_price_to: 0,
      filter_quantity_from: 0,
      filter_quantity_to: 0,
      filter_sort: 'id-asc',
      page: page,
      filter_id: '',
    };

    const response = await makeBaseLinkerRequest('getInventoryProductsList', parameters);
    
    logger.info(`Pobrano ${response.data.products ? response.data.products.length : 0} produktów`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania produktów: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera szczegóły produktu z magazynu BaseLinker
 * @param productId ID produktu
 * @param inventoryId ID magazynu (opcjonalne)
 */
export const getProductDetails = async (productId: string, inventoryId?: string) => {
  try {
    const parameters = {
      inventory_id: inventoryId || '',
      product_id: productId,
    };

    const response = await makeBaseLinkerRequest('getInventoryProductsData', parameters);
    
    logger.info(`Pobrano szczegóły produktu ID: ${productId}`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania szczegółów produktu ${productId}: ${baseLinkerError.message}`);
    throw error;
  }
};

// Interfejs dla przedmiotu zamówienia
interface OrderItem {
  order_id: string;
  [key: string]: any;
}

// Interfejs dla pojedynczego elementu zamówienia z BaseLinker
interface BaseLinkerOrderItem {
  [key: string]: any;
}

/**
 * Pobiera listę zamówień z BaseLinker
 * @param dateFrom Data początkowa (UNIX timestamp)
 * @param dateTo Data końcowa (UNIX timestamp)
 * @param page Numer strony wyników (opcjonalne)
 * @param limit Limit wyników na stronę (opcjonalne)
 */
export const getOrders = async (dateFrom: number, dateTo: number, page = 1, limit = 100) => {
  try {
    const parameters = {
      date_from: dateFrom,
      date_to: dateTo,
      get_unconfirmed_orders: true,
      filter_order_source_id: '',
      filter_order_source: '',
      filter_order_status_id: '',
      filter_order_id: '',
      filter_external_id: '',
      filter_order_email: '',
      filter_order_phone: '',
      filter_order_fullname: '',
      filter_product_id: '',
      filter_product_name: '',
      filter_sku: '',
      filter_sort: 'date_add-asc',
      page: page
    };

    const response = await makeBaseLinkerRequest('getOrders', parameters);
    
    logger.info(`Pobrano ${response.data.orders ? response.data.orders.length : 0} zamówień`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania zamówień: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera szczegóły zamówienia z BaseLinker
 * @param orderId ID zamówienia
 */
export const getOrderDetails = async (orderId: string) => {
  try {
    const parameters = {
      order_id: orderId
    };

    const response = await makeBaseLinkerRequest('getOrderDetails', parameters);
    
    logger.info(`Pobrano szczegóły zamówienia ID: ${orderId}`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania szczegółów zamówienia ${orderId}: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera listę pozycji zamówienia z BaseLinker
 * @param orderId ID zamówienia
 */
export const getOrderItems = async (orderId: string) => {
  try {
    // Używamy getOrderDetails, aby pobrać pozycje zamówienia
    const orderDetails = await getOrderDetails(orderId);
    
    logger.info(`Pobrano ${orderDetails.products ? orderDetails.products.length : 0} pozycji dla zamówienia ID: ${orderId}`);
    return orderDetails.products || [];
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania pozycji zamówienia ${orderId}: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Synchronizuje dane z BaseLinker (produkty, zamówienia, pozycje)
 * @param dateFrom Data początkowa synchronizacji (UNIX timestamp)
 * @param dateTo Data końcowa synchronizacji (UNIX timestamp)
 */
export const syncBaseLinkerData = async (dateFrom: number, dateTo: number) => {
  try {
    logger.info('Rozpoczęcie synchronizacji danych z BaseLinker');
    
    // Pobierz produkty
    const productsData = await getProducts();
    
    // Pobierz zamówienia
    const ordersData = await getOrders(dateFrom, dateTo);
    
    // Dla każdego zamówienia pobierz pozycje
    const orderItems: OrderItem[] = [];
    for (const order of ordersData.orders || []) {
      const items = await getOrderItems(order.order_id);
      orderItems.push(...items.map((item: BaseLinkerOrderItem) => ({ ...item, order_id: order.order_id })));
    }
    
    logger.info('Synchronizacja danych z BaseLinker zakończona pomyślnie');
    
    return {
      products: productsData.products || [],
      orders: ordersData.orders || [],
      orderItems
    };
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas synchronizacji danych z BaseLinker: ${baseLinkerError.message}`);
    throw error;
  }
};

export default {
  getProducts,
  getProductDetails,
  getOrders,
  getOrderDetails,
  getOrderItems,
  syncBaseLinkerData
}; 