"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLinkerConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.baseLinkerConfig = {
    // Podstawowa konfiguracja
    apiUrl: 'https://api.baselinker.com/connector.php',
    apiToken: process.env.BASELINKER_API_TOKEN,
    // Limity API
    rateLimit: {
        maxRequestsPerMinute: 100,
        minTimeBetweenRequests: 600, // 600ms = ~100 zapytań/minutę
        maxConcurrent: 1
    },
    // Domyślne wartości
    defaults: {
        pageSize: 100,
        orderDateRange: {
            days: 30 // Domyślnie pobieraj zamówienia z ostatnich 30 dni
        }
    },
    // Statusy zamówień
    orderStatuses: {
        NEW: 1,
        PROCESSING: 2,
        READY_TO_SEND: 3,
        SENT: 4,
        DELIVERED: 5,
        CANCELLED: 6
    }
};
