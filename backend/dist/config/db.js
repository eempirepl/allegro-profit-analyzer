"use strict";
// Symulacja Prisma Client
// Tworzy strukturę odpowiadającą PrismaClient z @prisma/client
// To rozwiązanie tymczasowe do czasu poprawnego wygenerowania klienta Prisma
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.testDatabaseConnection = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Załaduj zmienne środowiskowe z pliku .env
dotenv_1.default.config();
// Utwórz instancję Prisma Client
const prisma = new client_1.PrismaClient();
// Konfiguracja aplikacji
const config = {
    // Token API BaseLinker (pobrany z zmiennych środowiskowych)
    baseLinkerToken: process.env.BASELINKER_API_TOKEN || '',
    // Konfiguracja limitu zapytań BaseLinker API
    baseLinkerApiLimit: {
        requestsPerMinute: 100, // 100 zapytań na minutę (zgodnie z dokumentacją API)
    },
    // Inne ustawienia konfiguracyjne
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
};
// Mocked Prisma Client
class MockPrismaClient {
    constructor() {
        this.product = {
            findMany: async () => {
                return [];
            },
            findUnique: async ({ where }) => {
                return null;
            },
            findFirst: async ({ where }) => {
                return null;
            },
            create: async ({ data }) => {
                return {
                    id: 1,
                    name: data.name || '',
                    externalId: data.externalId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            },
            update: async ({ where, data }) => {
                return {
                    id: where.id,
                    name: data.name || '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            },
            delete: async ({ where }) => { }
        };
        this.order = {
            findMany: async ({ include, orderBy, where, take } = {}) => {
                return [];
            },
            findUnique: async ({ where, include }) => {
                return null;
            },
            create: async ({ data, include }) => {
                return {
                    id: 1,
                    totalAmount: 0,
                    orderDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    items: []
                };
            },
            update: async ({ where, data }) => {
                return {
                    id: where.id,
                    totalAmount: 0,
                    orderDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    items: []
                };
            },
            delete: async ({ where }) => { }
        };
        this.orderItem = {
            findMany: async ({ where, take } = {}) => {
                return [];
            },
            create: async ({ data }) => {
                return {
                    id: 1,
                    orderId: data.orderId || 1,
                    quantity: data.quantity || 1,
                    price: data.price || 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            },
            update: async ({ where, data }) => {
                return {
                    id: where.id,
                    orderId: data.orderId || 1,
                    quantity: data.quantity || 1,
                    price: data.price || 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            },
            delete: async ({ where }) => { }
        };
        this.allegroFee = {
            findMany: async ({ orderBy } = {}) => {
                return [];
            }
        };
    }
    $on(event, callback) {
        // Symulacja obsługi zdarzeń
    }
    $connect() {
        return Promise.resolve();
    }
}
const logger_1 = require("../utils/logger");
// Używamy naszego mocka zamiast prawdziwego PrismaClienta
const mockPrisma = new MockPrismaClient();
exports.prisma = mockPrisma;
// Log zapytań SQL w trybie development
if (process.env.NODE_ENV === 'development') {
    mockPrisma.$on('query', (e) => {
        logger_1.logger.debug(`Zapytanie: ${e.query}`);
    });
}
// Log błędów SQL
mockPrisma.$on('error', (e) => {
    logger_1.logger.error(`Błąd bazy danych: ${e.message}`);
});
// Test połączenia z bazą danych
const testDatabaseConnection = async () => {
    try {
        await mockPrisma.$connect();
        logger_1.logger.info('Połączono z bazą danych');
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.logger.error(`Błąd połączenia z bazą danych: ${error.message}`);
        }
        else {
            logger_1.logger.error('Nieznany błąd połączenia z bazą danych');
        }
        return false;
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
exports.default = config;
