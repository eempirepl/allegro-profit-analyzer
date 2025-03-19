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

// Konfiguracja klienta axios dla API NBP
const nbpClient = axios.create({
  baseURL: 'http://api.nbp.pl/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Typy dla obsługi błędów
interface BaseLinkerError {
  message: string;
  code?: string;
  status?: number;
}

// Interfejs dla kursu waluty
interface ExchangeRate {
  currency: string;
  code: string;
  mid: number;
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
 * Pobiera kursy walut z API NBP
 * @returns Obiekt z kursami walut (np. { EUR: 4.32, USD: 3.75 })
 */
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const response = await nbpClient.get('/exchangerates/tables/A?format=json');
    const rates = response.data[0].rates;
    
    // Przekształcamy tablicę kursów na obiekt { USD: 3.75, EUR: 4.32, ... }
    const ratesObject: Record<string, number> = {};
    rates.forEach((rate: ExchangeRate) => {
      ratesObject[rate.code] = rate.mid;
    });
    
    // Dodajemy PLN jako 1.0
    ratesObject['PLN'] = 1.0;
    
    logger.info(`Pobrano kursy walut: ${Object.keys(ratesObject).length} walut`);
    return ratesObject;
  } catch (error) {
    logger.error(`Błąd podczas pobierania kursów walut: ${error}`);
    // W przypadku błędu zwracamy domyślny obiekt z PLN
    return { 'PLN': 1.0 };
  }
};

/**
 * Pobiera listę zamówień z BaseLinker
 * @param dateFrom Data początkowa (UNIX timestamp)
 * @param dateTo Data końcowa (UNIX timestamp)
 * @param page Numer strony wyników (opcjonalne)
 */
export const getOrders = async (dateFrom: number, dateTo: number, page = 1) => {
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
      filter_sort: 'date_add-desc',
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
 * Pobiera listę ID produktów z magazynu BaseLinker
 * @param inventoryId ID magazynu (opcjonalne)
 * @param page Numer strony wyników
 */
export const getInventoryProductsList = async (inventoryId: string = '33644', page: number = 1) => {
  try {
    const parameters = {
      inventory_id: inventoryId,
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
      filter_id: ''
    };

    const response = await makeBaseLinkerRequest('getInventoryProductsList', parameters);
    
    logger.info(`Pobrano ${response.data.products ? response.data.products.length : 0} ID produktów z magazynu ${inventoryId} (strona ${page})`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania listy produktów z magazynu ${inventoryId}: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera szczegółowe dane produktów z magazynu BaseLinker
 * @param productIds Tablica ID produktów
 * @param inventoryId ID magazynu (opcjonalne)
 */
export const getInventoryProductsData = async (productIds: string[], inventoryId: string = '33644') => {
  try {
    const parameters = {
      inventory_id: inventoryId,
      products: productIds
    };

    const response = await makeBaseLinkerRequest('getInventoryProductsData', parameters);
    
    logger.info(`Pobrano szczegóły dla ${Object.keys(response.data.products || {}).length} produktów z magazynu ${inventoryId}`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania szczegółów produktów z magazynu ${inventoryId}: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Pobiera wszystkie produkty z magazynu BaseLinker (obsługa paginacji)
 * @param inventoryId ID magazynu (opcjonalne)
 */
export const getAllInventoryProducts = async (inventoryId: string = '33644') => {
  try {
    let allProductIds: string[] = [];
    let page = 1;
    let hasMoreProducts = true;
    
    // Pobieranie wszystkich ID produktów (paginacja)
    while (hasMoreProducts) {
      const response = await getInventoryProductsList(inventoryId, page);
      
      if (response.products && response.products.length > 0) {
        // Dodajemy ID produktów do listy
        allProductIds = [...allProductIds, ...response.products.map((product: any) => product.id.toString())];
        page++;
      } else {
        hasMoreProducts = false;
      }
      
      // Ograniczenie liczby stron (zabezpieczenie przed nieskończoną pętlą)
      if (page > 100) {
        logger.warn(`Przerwano pobieranie produktów z magazynu ${inventoryId} po osiągnięciu 100 stron`);
        hasMoreProducts = false;
      }
    }
    
    // Jeśli mamy produkty, pobieramy ich szczegóły
    if (allProductIds.length > 0) {
      // Podzielenie na mniejsze bloki, aby nie przekroczyć limitów API
      const chunkSize = 100;
      const productChunks = [];
      
      for (let i = 0; i < allProductIds.length; i += chunkSize) {
        productChunks.push(allProductIds.slice(i, i + chunkSize));
      }
      
      // Pobieranie szczegółów dla każdej partii
      const allProductsData: any = { products: {} };
      
      for (const chunk of productChunks) {
        const chunkData = await getInventoryProductsData(chunk, inventoryId);
        if (chunkData.products) {
          allProductsData.products = { ...allProductsData.products, ...chunkData.products };
        }
      }
      
      logger.info(`Pobrano łącznie ${Object.keys(allProductsData.products).length} produktów z magazynu ${inventoryId}`);
      return allProductsData;
    }
    
    logger.info(`Nie znaleziono produktów w magazynie ${inventoryId}`);
    return { products: {} };
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania wszystkich produktów z magazynu ${inventoryId}: ${baseLinkerError.message}`);
    throw error;
  }
};

/**
 * Oblicza wartość zamówienia na podstawie danych zamówienia
 * @param order Dane zamówienia
 * @returns Wartość zamówienia
 */
export const calculateOrderValue = (order: any): number => {
  if (order.payment_done && order.payment_done > 0) {
    return parseFloat(order.payment_done);
  }
  
  // Obliczanie wartości na podstawie pozycji i dostawy
  let orderValue = 0;
  
  // Dodajemy wartość pozycji
  if (order.products && Array.isArray(order.products)) {
    orderValue += order.products.reduce((total: number, product: any) => {
      const price = parseFloat(product.price_brutto) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  }
  
  // Dodajemy koszt dostawy
  if (order.delivery_price) {
    orderValue += parseFloat(order.delivery_price);
  }
  
  return orderValue;
};

/**
 * Oblicza łączną ilość w magazynie na podstawie danych produktu
 * @param product Dane produktu
 * @returns Łączna ilość w magazynie
 */
export const calculateTotalStock = (product: any): number => {
  if (!product.stock || typeof product.stock !== 'object') {
    return 0;
  }
  
  return Object.values(product.stock).reduce((total: number, quantity: any) => {
    return total + (parseFloat(quantity) || 0);
  }, 0);
};

export default {
  getExchangeRates,
  getOrders,
  getOrderDetails,
  getInventoryProductsList,
  getInventoryProductsData,
  getAllInventoryProducts,
  calculateOrderValue,
  calculateTotalStock
}; 