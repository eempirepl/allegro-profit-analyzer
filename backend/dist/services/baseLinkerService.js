"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalStock = exports.calculateOrderValue = exports.getAllInventoryProducts = exports.getInventoryProductsData = exports.getInventoryProductsList = exports.getOrderDetails = exports.getOrders = exports.getExchangeRates = void 0;
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const logger_1 = require("../utils/logger");
const db_1 = __importDefault(require("../config/db"));
// Konfiguracja limitera zapytań do BaseLinker API (100 zapytań na minutę)
const limiter = new bottleneck_1.default({
    minTime: 600, // minimalny czas między zapytaniami (ms) - 600ms = 100 zapytań na minutę
    maxConcurrent: 1, // maksymalna liczba jednoczesnych zapytań
});
// Konfiguracja klienta axios dla BaseLinker API
const baseLinkerClient = axios_1.default.create({
    baseURL: 'https://api.baselinker.com/connector.php',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});
// Konfiguracja klienta axios dla API NBP
const nbpClient = axios_1.default.create({
    baseURL: 'http://api.nbp.pl/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Funkcja pomocnicza do wykonania zapytania do BaseLinker z zastosowaniem limitera
const makeBaseLinkerRequest = async (method, parameters = {}) => {
    try {
        // Użycie limitera do ograniczenia liczby zapytań
        return await limiter.schedule(() => {
            logger_1.logger.info(`Wywołanie BaseLinker API: ${method}`);
            // Tworzymy parametry zgodnie z dokumentacją BaseLinker
            const params = new URLSearchParams();
            params.append('token', db_1.default.baseLinkerToken);
            params.append('method', method);
            if (Object.keys(parameters).length > 0) {
                params.append('parameters', JSON.stringify(parameters));
            }
            logger_1.logger.info(`Parametry zapytania: ${JSON.stringify(parameters)}`);
            return baseLinkerClient.post('', params);
        });
    }
    catch (error) {
        const baseLinkerError = error;
        logger_1.logger.error(`Błąd podczas wywołania BaseLinker API (${method}): ${baseLinkerError.message}`);
        throw error;
    }
};
/**
 * Pobiera kursy walut z API NBP
 * @returns Obiekt z kursami walut (np. { EUR: 4.32, USD: 3.75 })
 */
const getExchangeRates = async () => {
    try {
        const response = await nbpClient.get('/exchangerates/tables/A?format=json');
        const rates = response.data[0].rates;
        // Przekształcamy tablicę kursów na obiekt { USD: 3.75, EUR: 4.32, ... }
        const ratesObject = {};
        rates.forEach((rate) => {
            ratesObject[rate.code] = rate.mid;
        });
        // Dodajemy PLN jako 1.0
        ratesObject['PLN'] = 1.0;
        logger_1.logger.info(`Pobrano kursy walut: ${Object.keys(ratesObject).length} walut`);
        return ratesObject;
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania kursów walut: ${error}`);
        // W przypadku błędu zwracamy domyślny obiekt z PLN
        return { 'PLN': 1.0 };
    }
};
exports.getExchangeRates = getExchangeRates;
/**
 * Pobiera listę zamówień z BaseLinker
 * @param dateFrom Data początkowa (UNIX timestamp)
 * @param dateTo Data końcowa (UNIX timestamp)
 * @param page Numer strony wyników (opcjonalne)
 */
const getOrders = async (dateFrom, dateTo, page = 1) => {
    try {
        // Używamy parametrów zgodnych z przykładowym kodem, który działa
        const parameters = {
            // Używamy date_confirmed_from zamiast date_from
            date_confirmed_from: dateFrom,
            date_confirmed_to: dateTo,
            get_unconfirmed_orders: false, // Pobieramy tylko potwierdzone zamówienia
            filter_order_source_id: '',
            filter_order_source: '',
            filter_order_status_id: '',
            filter_order_id: '',
            filter_external_id: '',
            filter_email: '',
            filter_phone: '',
            filter_fullname: '',
            filter_product_id: '',
            filter_product_name: '',
            filter_sku: '',
            filter_sort: 'date_add-desc',
            page: page
        };
        logger_1.logger.info(`Pobieranie zamówień: date_confirmed_from=${dateFrom}, date_confirmed_to=${dateTo}, page=${page}`);
        const response = await makeBaseLinkerRequest('getOrders', parameters);
        if (!response.data.orders) {
            logger_1.logger.warn(`Brak zamówień do przetworzenia (odpowiedź BaseLinker: ${JSON.stringify(response.data)})`);
            return { orders: [] };
        }
        logger_1.logger.info(`Pobrano ${response.data.orders ? response.data.orders.length : 0} zamówień`);
        return response.data;
    }
    catch (error) {
        const baseLinkerError = error;
        logger_1.logger.error(`Błąd podczas pobierania zamówień: ${baseLinkerError.message}`);
        throw error;
    }
};
exports.getOrders = getOrders;
/**
 * Pobiera szczegóły zamówienia z BaseLinker
 * @param orderId ID zamówienia
 */
const getOrderDetails = async (orderId) => {
    try {
        const parameters = {
            order_id: orderId
        };
        const response = await makeBaseLinkerRequest('getOrderDetails', parameters);
        logger_1.logger.info(`Pobrano szczegóły zamówienia ID: ${orderId}`);
        return response.data;
    }
    catch (error) {
        const baseLinkerError = error;
        logger_1.logger.error(`Błąd podczas pobierania szczegółów zamówienia ${orderId}: ${baseLinkerError.message}`);
        throw error;
    }
};
exports.getOrderDetails = getOrderDetails;
/**
 * Pobiera listę ID produktów z magazynu BaseLinker
 * @param inventoryId ID magazynu (opcjonalne)
 * @param page Numer strony wyników
 */
const getInventoryProductsList = async (inventoryId = '33644', page = 1) => {
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
        logger_1.logger.info(`Pobrano ${response.data.products ? response.data.products.length : 0} ID produktów z magazynu ${inventoryId} (strona ${page})`);
        return response.data;
    }
    catch (error) {
        const baseLinkerError = error;
        logger_1.logger.error(`Błąd podczas pobierania listy produktów z magazynu ${inventoryId}: ${baseLinkerError.message}`);
        throw error;
    }
};
exports.getInventoryProductsList = getInventoryProductsList;
/**
 * Pobiera szczegółowe dane produktów z magazynu BaseLinker
 * @param productIds Tablica ID produktów
 * @param inventoryId ID magazynu (opcjonalne)
 */
const getInventoryProductsData = async (productIds, inventoryId = '33644') => {
    try {
        const parameters = {
            inventory_id: inventoryId,
            products: productIds
        };
        const response = await makeBaseLinkerRequest('getInventoryProductsData', parameters);
        logger_1.logger.info(`Pobrano szczegóły dla ${Object.keys(response.data.products || {}).length} produktów z magazynu ${inventoryId}`);
        return response.data;
    }
    catch (error) {
        const baseLinkerError = error;
        logger_1.logger.error(`Błąd podczas pobierania szczegółów produktów z magazynu ${inventoryId}: ${baseLinkerError.message}`);
        throw error;
    }
};
exports.getInventoryProductsData = getInventoryProductsData;
/**
 * Pobiera wszystkie produkty z magazynu BaseLinker (obsługa paginacji)
 * @param inventoryId ID magazynu (opcjonalne)
 */
const getAllInventoryProducts = async (inventoryId = '0') => {
    try {
        // Najpierw spróbujmy pobrać listę magazynów
        if (inventoryId === '0') {
            try {
                const inventoriesResponse = await makeBaseLinkerRequest('getInventories');
                const inventories = inventoriesResponse.data.inventories || [];
                if (inventories.length > 0) {
                    logger_1.logger.info(`Znaleziono ${inventories.length} magazynów: ${inventories.map((inv) => `${inv.inventory_id} (${inv.name})`).join(', ')}`);
                    // Jeśli mamy magazyny, pobieramy produkty z każdego z nich
                    let allProductsData = { products: {} };
                    for (const inventory of inventories) {
                        try {
                            // Pobieramy produkty z każdego magazynu
                            let page = 1;
                            let hasMoreProducts = true;
                            let inventoryProductIds = [];
                            // Pobieranie wszystkich ID produktów (paginacja)
                            while (hasMoreProducts) {
                                const response = await (0, exports.getInventoryProductsList)(inventory.inventory_id, page);
                                if (response.products && response.products.length > 0) {
                                    // Dodajemy ID produktów do listy
                                    inventoryProductIds = [...inventoryProductIds, ...response.products.map((product) => product.id.toString())];
                                    page++;
                                }
                                else {
                                    hasMoreProducts = false;
                                }
                                // Ograniczenie liczby stron (zabezpieczenie przed nieskończoną pętlą)
                                if (page > 100) {
                                    hasMoreProducts = false;
                                }
                            }
                            // Jeśli mamy produkty, pobieramy ich szczegóły
                            if (inventoryProductIds.length > 0) {
                                // Podzielenie na mniejsze bloki, aby nie przekroczyć limitów API
                                const chunkSize = 100;
                                const productChunks = [];
                                for (let i = 0; i < inventoryProductIds.length; i += chunkSize) {
                                    productChunks.push(inventoryProductIds.slice(i, i + chunkSize));
                                }
                                // Pobieranie szczegółów dla każdej partii
                                for (const chunk of productChunks) {
                                    const productsData = await (0, exports.getInventoryProductsData)(chunk, inventory.inventory_id);
                                    // Dodajemy produkty do całkowitego zbioru
                                    allProductsData.products = {
                                        ...allProductsData.products,
                                        ...productsData.products
                                    };
                                }
                            }
                        }
                        catch (error) {
                            logger_1.logger.error(`Błąd podczas pobierania produktów z magazynu ${inventory.inventory_id}: ${error}`);
                            // Kontynuuj mimo błędu
                        }
                    }
                    logger_1.logger.info(`Pobrano łącznie ${Object.keys(allProductsData.products).length} produktów z wszystkich magazynów`);
                    return allProductsData;
                }
                else {
                    logger_1.logger.warn('Nie znaleziono żadnych magazynów w koncie BaseLinker');
                    return { products: {} };
                }
            }
            catch (error) {
                logger_1.logger.error(`Błąd podczas pobierania listy magazynów: ${error}`);
                // W przypadku błędu, przekierowujemy do standardowego pobierania
            }
        }
        // Standardowa ścieżka - pobieranie produktów z jednego magazynu
        let allProductIds = [];
        let page = 1;
        let hasMoreProducts = true;
        // Pobieranie wszystkich ID produktów (paginacja)
        while (hasMoreProducts) {
            const response = await (0, exports.getInventoryProductsList)(inventoryId, page);
            if (response.products && response.products.length > 0) {
                // Dodajemy ID produktów do listy
                allProductIds = [...allProductIds, ...response.products.map((product) => product.id.toString())];
                page++;
            }
            else {
                hasMoreProducts = false;
                if (page === 1) {
                    logger_1.logger.info(`Nie znaleziono produktów w magazynie ${inventoryId}`);
                }
            }
            // Ograniczenie liczby stron (zabezpieczenie przed nieskończoną pętlą)
            if (page > 100) {
                logger_1.logger.warn(`Przerwano pobieranie produktów z magazynu ${inventoryId} po osiągnięciu 100 stron`);
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
            const allProductsData = { products: {} };
            for (const chunk of productChunks) {
                const productsData = await (0, exports.getInventoryProductsData)(chunk, inventoryId);
                // Dodajemy produkty do całkowitego zbioru
                allProductsData.products = {
                    ...allProductsData.products,
                    ...productsData.products
                };
            }
            logger_1.logger.info(`Pobrano szczegóły dla ${Object.keys(allProductsData.products).length} produktów z magazynu ${inventoryId}`);
            return allProductsData;
        }
        else {
            return { products: {} };
        }
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania wszystkich produktów z magazynów: ${error}`);
        throw error;
    }
};
exports.getAllInventoryProducts = getAllInventoryProducts;
/**
 * Oblicza wartość zamówienia na podstawie danych zamówienia
 * @param order Dane zamówienia
 * @returns Wartość zamówienia
 */
const calculateOrderValue = (order) => {
    // Jeśli jest payment_done i jest większe od 0, to zwracamy tę wartość
    if (order.payment_done && parseFloat(order.payment_done) > 0) {
        return parseFloat(order.payment_done);
    }
    // W przeciwnym razie obliczamy na podstawie produktów i dostawy
    let total = parseFloat(order.delivery_price || '0');
    if (order.products && Array.isArray(order.products) && order.products.length > 0) {
        for (const product of order.products) {
            const price = parseFloat(product.price_brutto || '0');
            const quantity = parseInt(product.quantity || '0', 10);
            total += price * quantity;
        }
    }
    return total;
};
exports.calculateOrderValue = calculateOrderValue;
/**
 * Oblicza łączną ilość w magazynie na podstawie danych produktu
 * @param product Dane produktu
 * @returns Łączna ilość w magazynie
 */
const calculateTotalStock = (product) => {
    if (!product.stock || typeof product.stock !== 'object') {
        return 0;
    }
    return Object.values(product.stock).reduce((total, quantity) => {
        return total + (parseFloat(quantity) || 0);
    }, 0);
};
exports.calculateTotalStock = calculateTotalStock;
exports.default = {
    getExchangeRates: exports.getExchangeRates,
    getOrders: exports.getOrders,
    getOrderDetails: exports.getOrderDetails,
    getInventoryProductsList: exports.getInventoryProductsList,
    getInventoryProductsData: exports.getInventoryProductsData,
    getAllInventoryProducts: exports.getAllInventoryProducts,
    calculateOrderValue: exports.calculateOrderValue,
    calculateTotalStock: exports.calculateTotalStock
};
