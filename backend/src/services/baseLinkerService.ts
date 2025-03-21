import axios from 'axios';
import Bottleneck from 'bottleneck';
import { baseLinkerConfig } from '../config/baseLinkerConfig';
import { logger } from '../utils/logger';
import { 
  ProductsResponseData, 
  OrdersResponseData, 
  OrderDetailsResponseData,
  BaseLinkerError,
  InventoriesResponseData,
  ProductsListResponse,
  ProductsDataResponse,
  BaseLinkerProductDetail
} from '../types/baseLinkerTypes';

class BaseLinkerService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly limiter: Bottleneck;

  constructor() {
    this.token = baseLinkerConfig.apiToken;
    if (!this.token) {
      throw new Error('BaseLinker API token is not configured');
    }
    
    this.apiUrl = baseLinkerConfig.apiUrl;
    this.limiter = new Bottleneck({
      maxConcurrent: baseLinkerConfig.maxConcurrentRequests,
      minTime: baseLinkerConfig.minTimeBetweenRequests
    });
  }

  private async makeRequest<T>(method: string, parameters: Record<string, any> = {}): Promise<T> {
    const params = new URLSearchParams();
    params.append('token', this.token);
    params.append('method', method);
    params.append('parameters', JSON.stringify(parameters));

    try {
      logger.info(`Wywołanie BaseLinker API: ${method}`);
      logger.info(`Token API: ${this.token ? 'ustawiony' : 'brak'}`);
      const response = await this.limiter.schedule(() => axios.post(this.apiUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }));

      logger.info(`Odpowiedź z BaseLinker API (${method}):`, response.data);

      if (response.data.error_code) {
        const error = response.data;
        throw new Error(`Błąd BaseLinker API: ${error.error_message || error.error_code}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Błąd podczas wywołania BaseLinker API (${method}):`, error.response?.data || error.message);
        throw new Error(`Błąd połączenia z BaseLinker API: ${error.message}`);
      }
      throw error;
    }
  }

  // Pobieranie listy produktów
  async getProducts(options: { page?: number; limit?: number; inventoryId?: string } = {}): Promise<ProductsListResponse> {
    try {
      const { page = 1, limit = 100, inventoryId } = options;
      
      if (!inventoryId) {
        throw new Error('Nie podano ID magazynu');
      }
      
      const parameters: Record<string, any> = {
        inventory_id: inventoryId,
        page,
        limit
      };
      
      const response = await this.makeRequest<ProductsListResponse>('getInventoryProductsList', parameters);
      logger.info(`Pobrano ${response.products ? Object.keys(response.products).length : 0} produktów`);
      return response;
    } catch (error) {
      logger.error('Błąd podczas pobierania produktów:', error);
      throw error;
    }
  }

  // Pobieranie szczegółowych danych produktu
  async getProductDetails(productId: string, inventoryId: string): Promise<BaseLinkerProductDetail> {
    try {
      if (!inventoryId) {
        throw new Error('Nie podano ID magazynu');
      }

      const parameters = {
        inventory_id: inventoryId,
        products: [productId],
        include_erp_units: true,
        include_wms_units: true,
        include_additional_eans: true
      };

      const response = await this.makeRequest<ProductsDataResponse>('getInventoryProductsData', parameters);
      if (response && response.products && response.products[productId]) {
        logger.info(`Pobrano szczegółowe dane produktu ${productId}`);
        return response.products[productId];
      } else {
        logger.error(`Produkt ${productId} nie został znaleziony`);
        throw new Error(`Produkt ${productId} nie został znaleziony`);
      }
    } catch (error) {
      logger.error(`Błąd podczas pobierania szczegółowych danych produktu ${productId}:`, error);
      throw error;
    }
  }

  // Pobieranie zamówień
  async getOrders(options: { dateFrom?: number; dateTo?: number; statusId?: number; page?: number; limit?: number } = {}): Promise<OrdersResponseData> {
    try {
      const { dateFrom, dateTo, statusId, page = 1, limit = 100 } = options;
      
      const parameters: Record<string, any> = {
        page,
        limit
      };
      
      if (dateFrom) parameters.date_from = dateFrom;
      if (dateTo) parameters.date_to = dateTo;
      if (statusId) parameters.status_id = statusId;
      
      const response = await this.makeRequest<OrdersResponseData>('getOrders', parameters);
      logger.info(`Pobrano ${response.orders.length} zamówień`);
      return response;
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
      const products = productsResponse.products;
      
      // Pobierz zamówienia
      const ordersResponse = await this.getOrders({ dateFrom, dateTo });
      const orders = ordersResponse.orders;
      
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
      await this.makeRequest<InventoriesResponseData>('getInventories', {});
      logger.info('Test połączenia z BaseLinker API: Sukces');
      return true;
    } catch (error) {
      logger.error('Test połączenia z BaseLinker API: Błąd', error);
      return false;
    }
  }

  // Pobieranie listy magazynów
  async getInventories(): Promise<InventoriesResponseData['inventories']> {
    try {
      logger.info('Rozpoczynam pobieranie listy magazynów');
      const response = await this.makeRequest<InventoriesResponseData>('getInventories', {});
      logger.info('Surowa odpowiedź z BaseLinker API:', JSON.stringify(response));
      
      if (response && response.inventories) {
        logger.info(`Pobrano ${response.inventories.length} magazynów`);
        return response.inventories;
      } else {
        logger.error('Błąd w odpowiedzi BaseLinker API:', response);
        return [];
      }
    } catch (error) {
      logger.error('Błąd podczas pobierania listy magazynów:', error);
      throw error;
    }
  }
}

// Eksportujemy pojedynczą instancję serwisu
export const baseLinkerService = new BaseLinkerService();