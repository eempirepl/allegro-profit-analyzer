"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLinkerLimiter = void 0;
exports.executeWithRateLimit = executeWithRateLimit;
const bottleneck_1 = __importDefault(require("bottleneck"));
const logger_1 = require("./logger");
/**
 * Konfiguracja limitera zapytań API BaseLinker
 * BaseLinker posiada limit 100 zapytań na minutę (1.67 zapytań na sekundę)
 * Ustawiamy limiter nieco poniżej tego limitu dla bezpieczeństwa
 */
exports.baseLinkerLimiter = new bottleneck_1.default({
    maxConcurrent: 1, // Liczba jednoczesnych zapytań
    minTime: 600, // 600ms między zapytaniami = ~100 zapytań/min
    highWater: 10, // Limit zapytań w kolejce oczekujących
    strategy: bottleneck_1.default.strategy.BLOCK, // Strategia blokowania po przekroczeniu limitu
});
// Dodanie nasłuchiwania na zdarzenia limitera dla debugowania
exports.baseLinkerLimiter.on('failed', (error, jobInfo) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger_1.logger.error(`Błąd zapytania API (próba ${jobInfo.retryCount}): ${errorMessage}`);
});
exports.baseLinkerLimiter.on('retry', (error, jobInfo) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger_1.logger.warn(`Ponowna próba zapytania API (${jobInfo.retryCount}): ${errorMessage}`);
});
exports.baseLinkerLimiter.on('depleted', () => {
    logger_1.logger.warn('Wyczerpanie limitu zapytań API - oczekiwanie na zwolnienie zasobów');
});
exports.baseLinkerLimiter.on('debug', (message) => {
    logger_1.logger.debug(`Limiter debug: ${message}`);
});
/**
 * Funkcja do wykonywania zapytań API z limitowaniem
 * @param jobFn Funkcja asynchroniczna do wykonania w ramach limitera
 * @param jobName Nazwa zadania (opcjonalna) - do logowania
 * @returns Wynik zadania
 */
async function executeWithRateLimit(jobFn, jobName = 'BaseLinkerAPI') {
    try {
        logger_1.logger.debug(`Kolejkowanie zadania: ${jobName}`);
        const result = await exports.baseLinkerLimiter.schedule(() => jobFn());
        logger_1.logger.debug(`Ukończono zadanie: ${jobName}`);
        return result;
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.logger.error(`Błąd zadania ${jobName}: ${error.message}`);
        }
        else {
            logger_1.logger.error(`Nieznany błąd zadania ${jobName}`);
        }
        throw error;
    }
}
exports.default = {
    baseLinkerLimiter: exports.baseLinkerLimiter,
    executeWithRateLimit
};
