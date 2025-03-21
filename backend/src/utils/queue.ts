import Bottleneck from 'bottleneck';
import { logger } from './logger';

/**
 * Konfiguracja limitera zapytań API BaseLinker
 * BaseLinker posiada limit 100 zapytań na minutę (1.67 zapytań na sekundę)
 * Ustawiamy limiter nieco poniżej tego limitu dla bezpieczeństwa
 */
export const baseLinkerLimiter = new Bottleneck({
  maxConcurrent: 1,         // Liczba jednoczesnych zapytań
  minTime: 600,             // 600ms między zapytaniami = ~100 zapytań/min
  highWater: 10,            // Limit zapytań w kolejce oczekujących
  strategy: Bottleneck.strategy.BLOCK, // Strategia blokowania po przekroczeniu limitu
});

// Dodanie nasłuchiwania na zdarzenia limitera dla debugowania
baseLinkerLimiter.on('failed', (error: Error | unknown, jobInfo) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`Błąd zapytania API (próba ${jobInfo.retryCount}): ${errorMessage}`);
});

baseLinkerLimiter.on('retry', (error: Error | unknown, jobInfo) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.warn(`Ponowna próba zapytania API (${jobInfo.retryCount}): ${errorMessage}`);
});

baseLinkerLimiter.on('depleted', () => {
  logger.warn('Wyczerpanie limitu zapytań API - oczekiwanie na zwolnienie zasobów');
});

baseLinkerLimiter.on('debug', (message) => {
  logger.debug(`Limiter debug: ${message}`);
});

/**
 * Funkcja do wykonywania zapytań API z limitowaniem
 * @param jobFn Funkcja asynchroniczna do wykonania w ramach limitera
 * @param jobName Nazwa zadania (opcjonalna) - do logowania
 * @returns Wynik zadania
 */
export async function executeWithRateLimit<T>(
  jobFn: () => Promise<T>,
  jobName: string = 'BaseLinkerAPI'
): Promise<T> {
  try {
    logger.debug(`Kolejkowanie zadania: ${jobName}`);
    const result = await baseLinkerLimiter.schedule(() => jobFn());
    logger.debug(`Ukończono zadanie: ${jobName}`);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Błąd zadania ${jobName}: ${error.message}`);
    } else {
      logger.error(`Nieznany błąd zadania ${jobName}`);
    }
    throw error;
  }
}

export default {
  baseLinkerLimiter,
  executeWithRateLimit
}; 