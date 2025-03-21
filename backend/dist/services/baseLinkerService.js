"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLinkerService = void 0;
const logger_1 = require("../utils/logger");
class BaseLinkerService {
    constructor() {
        this.token = null;
    }
    setToken(token) {
        this.token = token;
        logger_1.logger.info('Token API: ustawiony');
    }
    async makeRequest(method, parameters = {}) {
        if (!this.token) {
            throw new Error('Token API nie został ustawiony');
        }
        try {
            logger_1.logger.info(`Wywołanie BaseLinker API: ${method}`);
            const response = await fetch('https://api.baselinker.com/connector.php', {
                method: 'POST',
                headers: {
                    'X-BLToken': this.token,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    method,
                    parameters: JSON.stringify(parameters)
                }).toString()
            });
            const data = await response.json();
            logger_1.logger.info(`Odpowiedź z BaseLinker API (${method}):`);
            if (data.status === 'ERROR') {
                const error = {
                    error_code: data.error_code,
                    error_message: data.error_message
                };
                throw new Error(`Błąd BaseLinker API: ${error.error_message}`);
            }
            return data;
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas wywołania ${method}:`, error);
            throw error;
        }
    }
    // Pobieranie listy produktów
    async getProducts(options) {
        try {
            const response = await this.makeRequest('getInventoryProductsList', options);
            logger_1.logger.info(`Pobrano produkty z magazynu ${options.inventory_id}`);
            return response;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania produktów:', error);
            throw error;
        }
    }
    // Pobieranie szczegółów produktów
    async getProductDetails(options) {
        try {
            const response = await this.makeRequest('getInventoryProductsData', options);
            logger_1.logger.info(`Pobrano szczegóły produktów z magazynu ${options.inventory_id}`);
            return response;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania szczegółów produktów:', error);
            throw error;
        }
    }
    // Pobieranie listy magazynów
    async getInventories() {
        try {
            const response = await this.makeRequest('getInventories');
            logger_1.logger.info('Pobrano listę magazynów');
            return response;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania listy magazynów:', error);
            throw error;
        }
    }
    // Pobieranie listy zamówień
    async getOrders(parameters = {}) {
        try {
            const response = await this.makeRequest('getOrders', parameters);
            logger_1.logger.info('Pobrano listę zamówień');
            return response;
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas pobierania listy zamówień:', error);
            throw error;
        }
    }
    // Pobieranie szczegółów zamówienia
    async getOrderDetails(orderId) {
        try {
            const response = await this.makeRequest('getOrderDetails', { order_id: orderId });
            logger_1.logger.info(`Pobrano szczegóły zamówienia ID: ${orderId}`);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`Błąd podczas pobierania szczegółów zamówienia ${orderId}:`, error);
            throw error;
        }
    }
}
exports.baseLinkerService = new BaseLinkerService();
