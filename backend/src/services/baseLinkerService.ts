import axios from 'axios';
import Bottleneck from 'bottleneck';
import { logger } from '../utils/logger';
import { baseLinkerConfig } from '../config/baseLinker';
import {
  BaseLinkerError,
  BaseLinkerProduct,
  BaseLinkerOrder,
  BaseLinkerResponse,
  ProductsResponseData,
  OrdersResponseData,
  OrderDetailsResponseData,
  GetProductsParams,
  GetOrdersParams,
  ProductsResponse
} from '../types/baseLinker';

// Konfiguracja limitera zapytań na podstawie konfiguracji
const limiter = new Bottleneck({
  maxConcurrent: baseLinkerConfig.rateLimit.maxConcurrent,
  minTime: baseLinkerConfig.rateLimit.minTimeBetweenRequests
});

class BaseLinkerService {
  private readonly apiUrl: string;
  private readonly token: string;

  constructor() {
    const token = baseLinkerConfig.apiToken;
    if (!token) {
      throw new Error('Brak tokenu API BaseLinker');
    }
    this.token = token;
    this.apiUrl = baseLinkerConfig.apiUrl;
  }

  // Metoda pomocnicza do wykonywania zapytań do API
  private async makeRequest<T>(method: string, parameters: Record<string, any> = {}): Promise<T> {
    const params = new URLSearchParams();
    params.append('method', method);
    params.append('parameters', JSON.stringify(parameters));
    params.append('token', this.token);

    try {
      logger.info(`Wywołanie BaseLinker API: ${method}`);
      const response = await limiter.schedule(() => 
        axios.post<BaseLinkerResponse<T>>(this.apiUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      if (response.data.error_code) {
        const error = response.data as BaseLinkerError;
        throw new Error(`Błąd BaseLinker API: ${error.error_message || error.error_code}`);
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Błąd podczas wywołania BaseLinker API (${method}):`, error.response?.data || error.message);
        throw new Error(`Błąd połączenia z BaseLinker API: ${error.message}`);
      }
      throw error;
    }
  }

  // Pobieranie listy produktów
  async getProducts({ page = 1, limit = baseLinkerConfig.defaults.pageSize, inventoryId }: GetProductsParams = {}): Promise<ProductsResponse> {
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
        page,
        limit
      };

      const response = await this.makeRequest<ProductsResponseData>('getInventoryProductsList', parameters);
      logger.info(`Pobrano ${response.products.length} produktów (strona ${page})`);
      return {
        status: 'SUCCESS',
        data: response
      };
    } catch (error) {
      logger.error('Błąd podczas pobierania produktów:', error);
      throw error;
    }
  }

  // Pobieranie szczegółów produktu
  async getProductDetails(productId: string, inventoryId?: string): Promise<BaseLinkerProduct> {
    try {
      const response = await this.makeRequest<{ product: BaseLinkerProduct }>('getInventoryProductData', {
        inventory_id: inventoryId || '',
        product_id: productId
      });
      logger.info(`Pobrano szczegóły produktu ID: ${productId}`);
      return response.product;
    } catch (error) {
      logger.error(`Błąd podczas pobierania szczegółów produktu ${productId}:`, error);
      throw error;
    }
  }

  // Pobieranie listy zamówień
  async getOrders({ dateFrom, dateTo, statusId, page = 1, limit = baseLinkerConfig.defaults.pageSize }: GetOrdersParams = {}): Promise<BaseLinkerOrder[]> {
    try {
      // Jeśli nie podano zakresu dat, użyj domyślnego (ostatnie X dni)
      if (!dateFrom) {
        const defaultDays = baseLinkerConfig.defaults.orderDateRange.days;
        dateFrom = Math.floor(Date.now() / 1000) - (defaultDays * 24 * 60 * 60);
      }

      const parameters = {
        date_from: dateFrom,
        date_to: dateTo,
        get_unconfirmed_orders: true,
        status_id: statusId,
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
        page
      };

      const response = await this.makeRequest<OrdersResponseData>('getOrders', parameters);
      logger.info(`Pobrano ${response.orders.length} zamówień`);
      return response.orders;
    } catch (error) {
      logger.error('Błąd podczas pobierania zamówień:', error);
      throw error;
    }
  }

  // Pobieranie szczegółów zamówienia
  async getOrderDetails(orderId: string): Promise<OrderDetailsResponseData> {
    try {
      const response = await this.makeRequest<OrderDetailsResponseData>('getOrderDetails', {
        order_id: orderId
      });
      
      logger.info(`Pobrano szczegóły zamówienia ID: ${orderId} (${response.items.length} pozycji)`);
      return response;
    } catch (error) {
      logger.error(`Błąd podczas pobierania szczegółów zamówienia ${orderId}:`, error);
      throw error;
    }
  }

  // Pobieranie pozycji zamówienia
  async getOrderItems(orderId: string) {
    try {
      const orderDetails = await this.getOrderDetails(orderId);
      return orderDetails.items;
    } catch (error) {
      logger.error(`Błąd podczas pobierania pozycji zamówienia ${orderId}:`, error);
      throw error;
    }
  }

  // Synchronizacja danych
  async syncData(dateFrom: number, dateTo: number) {
    try {
      logger.info('Rozpoczęcie synchronizacji danych z BaseLinker');
      
      // Pobierz produkty
      const productsResponse = await this.getProducts();
      const products = productsResponse.data.products;
      
      // Pobierz zamówienia
      const orders = await this.getOrders({ dateFrom, dateTo });
      
      // Dla każdego zamówienia pobierz pozycje
      const orderItems = [];
      for (const order of orders) {
        const items = await this.getOrderItems(order.order_id);
        orderItems.push(...items.map(item => ({ ...item, order_id: order.order_id })));
      }
      
      logger.info('Synchronizacja danych z BaseLinker zakończona pomyślnie');
      
      return {
        products,
        orders,
        orderItems
      };
    } catch (error) {
      logger.error('Błąd podczas synchronizacji danych z BaseLinker:', error);
      throw error;
    }
  }

  // Testowanie połączenia z API
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<ProductsResponseData>('getInventoryProductsList', { page: 1, limit: 1 });
      logger.info('Test połączenia z BaseLinker API: Sukces');
      return true;
    } catch (error) {
      logger.error('Test połączenia z BaseLinker API: Błąd', error);
      return false;
    }
  }
}

// Eksportujemy pojedynczą instancję serwisu
export const baseLinkerService = new BaseLinkerService(); 