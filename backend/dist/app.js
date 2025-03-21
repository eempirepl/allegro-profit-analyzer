"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freePortAndRestart = freePortAndRestart;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("express-async-errors");
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_1 = require("./routes/productRoutes");
const orderRoutes_1 = require("./routes/orderRoutes");
const baselinkerRoutes_1 = __importDefault(require("./routes/baselinkerRoutes"));
const allegroRoutes_1 = require("./routes/allegroRoutes");
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./utils/logger");
const child_process_1 = require("child_process");
const csvImportRoutes_1 = __importDefault(require("./routes/csvImportRoutes"));
const path_1 = __importDefault(require("path"));
// Ładowanie zmiennych środowiskowych
dotenv_1.default.config();
// Funkcja sprawdzająca i zwalniająca port
function ensurePortAvailable(port) {
    try {
        // Sprawdź czy port jest używany
        const isWindows = process.platform === 'win32';
        if (isWindows) {
            try {
                const data = (0, child_process_1.execSync)(`netstat -ano | findstr :${port}`).toString();
                if (data) {
                    // Wyodrębnij PID
                    const pidMatch = data.match(/\s+(\d+)$/m);
                    if (pidMatch) {
                        const pid = pidMatch[1].trim();
                        logger_1.logger.info(`Port ${port} jest używany przez proces o PID ${pid}. Zwalniam...`);
                        (0, child_process_1.execSync)(`taskkill /F /PID ${pid}`);
                        logger_1.logger.info(`Port ${port} został zwolniony.`);
                        // Poczekaj chwilę, aby port został w pełni zwolniony
                        setTimeout(() => { }, 1000);
                    }
                }
            }
            catch (e) {
                // Ignoruj błędy, port może być już wolny
            }
        }
        else {
            // Wersja dla Linux/Mac
            try {
                const data = (0, child_process_1.execSync)(`lsof -i:${port} -t`).toString();
                if (data) {
                    const pid = data.trim();
                    logger_1.logger.info(`Port ${port} jest używany przez proces o PID ${pid}. Zwalniam...`);
                    (0, child_process_1.execSync)(`kill -9 ${pid}`);
                    logger_1.logger.info(`Port ${port} został zwolniony.`);
                    // Poczekaj chwilę, aby port został w pełni zwolniony
                    setTimeout(() => { }, 1000);
                }
            }
            catch (e) {
                // Ignoruj błędy, port może być już wolny
            }
        }
    }
    catch (err) {
        logger_1.logger.warn(`Port ${port} jest wolny lub nie można go zwolnić automatycznie.`);
    }
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3003;
// Upewnij się, że port jest dostępny przed uruchomieniem serwera
ensurePortAvailable(PORT);
// Konfiguracja CORS
app.use((0, cors_1.default)({
    origin: '*', // Zezwalaj na dostęp z dowolnego źródła
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400 // 24 godziny
}));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logowanie żądań
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});
// Obsługa plików statycznych
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Trasy
app.use('/api/baselinker', baselinkerRoutes_1.default);
app.use('/api/products', productRoutes_1.productRoutes);
app.use('/api/orders', orderRoutes_1.orderRoutes);
app.use('/api/allegro', allegroRoutes_1.allegroRoutes);
app.use('/api/sync', syncRoutes_1.default);
app.use('/api/csv', csvImportRoutes_1.default);
// Trasa główna
app.get('/', (req, res) => {
    res.json({ message: 'API działa poprawnie' });
});
// Obsługa błędów
app.use(errorHandler_1.errorHandler);
// Obsługa trasy, która nie istnieje
app.use((req, res) => {
    logger_1.logger.warn(`Próba dostępu do nieistniejącego endpointu: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Endpoint nie istnieje' });
});
// Komenda do zwolnienia portu i restartu serwera
function freePortAndRestart() {
    try {
        logger_1.logger.info('Zwalnianie portu 3001...');
        if (process.platform === 'win32') {
            (0, child_process_1.execSync)('netstat -ano | findstr :3001').toString().split('\n').forEach(line => {
                const match = line.match(/\s+(\d+)$/);
                if (match) {
                    try {
                        (0, child_process_1.execSync)(`taskkill /F /PID ${match[1]}`);
                        logger_1.logger.info(`Zwolniono proces o PID ${match[1]}`);
                    }
                    catch (e) { }
                }
            });
        }
        else {
            (0, child_process_1.execSync)('lsof -i:3001 -t').toString().split('\n').forEach(pid => {
                if (pid) {
                    try {
                        (0, child_process_1.execSync)(`kill -9 ${pid}`);
                        logger_1.logger.info(`Zwolniono proces o PID ${pid}`);
                    }
                    catch (e) { }
                }
            });
        }
        logger_1.logger.info('Restartowanie serwera...');
        require('child_process').spawn('npm', ['run', 'dev'], {
            detached: true,
            stdio: 'ignore'
        }).unref();
    }
    catch (e) {
        logger_1.logger.error('Błąd podczas zwalniania portu:', e);
    }
}
// Uruchamianie serwera
try {
    const server = app.listen(PORT, () => {
        logger_1.logger.info(`Serwer działa na porcie: ${PORT}`);
        logger_1.logger.info(`Środowisko: ${process.env.NODE_ENV}`);
    });
    // Obsługa zamknięcia serwera
    process.on('SIGTERM', () => {
        logger_1.logger.info('Otrzymano sygnał SIGTERM - zamykanie serwera');
        server.close(() => {
            logger_1.logger.info('Serwer został zamknięty');
            process.exit(0);
        });
    });
}
catch (error) {
    logger_1.logger.error('Błąd podczas uruchamiania serwera:', error);
    process.exit(1);
}
exports.default = app;
