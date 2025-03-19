"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
// Konfiguracja lokalizacji plików logów
const logDir = path_1.default.join(__dirname, '../../logs');
// Konfiguracja formatu logów
const logFormat = winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json());
// Tworzenie loggera z konfiguracją
exports.logger = (0, winston_1.createLogger)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'allegro-profit-analyzer' },
    transports: [
        // Zapisywanie wszystkich logów do pliku combined.log
        new winston_1.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            level: 'info'
        }),
        // Zapisywanie logów błędów do pliku error.log
        new winston_1.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error'
        }),
        // Wyświetlanie wszystkich logów w konsoli w środowisku deweloperskim
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)),
        })
    ],
    // Obsługa wyjątków niezłapanych
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: path_1.default.join(logDir, 'exceptions.log')
        })
    ]
});
exports.default = exports.logger;
