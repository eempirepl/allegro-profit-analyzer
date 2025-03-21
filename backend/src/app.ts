import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { productRoutes } from './routes/productRoutes';
import { orderRoutes } from './routes/orderRoutes';
import baselinkerRoutes from './routes/baselinkerRoutes';
import { allegroRoutes } from './routes/allegroRoutes';
import syncRoutes from './routes/syncRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { execSync } from 'child_process';
import csvImportRoutes from './routes/csvImportRoutes';
import path from 'path';

// Ładowanie zmiennych środowiskowych
dotenv.config();

// Funkcja sprawdzająca i zwalniająca port
function ensurePortAvailable(port: number): void {
  try {
    // Sprawdź czy port jest używany
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      try {
        const data = execSync(`netstat -ano | findstr :${port}`).toString();
        if (data) {
          // Wyodrębnij PID
          const pidMatch = data.match(/\s+(\d+)$/m);
          if (pidMatch) {
            const pid = pidMatch[1].trim();
            logger.info(`Port ${port} jest używany przez proces o PID ${pid}. Zwalniam...`);
            execSync(`taskkill /F /PID ${pid}`);
            logger.info(`Port ${port} został zwolniony.`);
            // Poczekaj chwilę, aby port został w pełni zwolniony
            setTimeout(() => {}, 1000);
          }
        }
      } catch (e) {
        // Ignoruj błędy, port może być już wolny
      }
    } else {
      // Wersja dla Linux/Mac
      try {
        const data = execSync(`lsof -i:${port} -t`).toString();
        if (data) {
          const pid = data.trim();
          logger.info(`Port ${port} jest używany przez proces o PID ${pid}. Zwalniam...`);
          execSync(`kill -9 ${pid}`);
          logger.info(`Port ${port} został zwolniony.`);
          // Poczekaj chwilę, aby port został w pełni zwolniony
          setTimeout(() => {}, 1000);
        }
      } catch (e) {
        // Ignoruj błędy, port może być już wolny
      }
    }
  } catch (err) {
    logger.warn(`Port ${port} jest wolny lub nie można go zwolnić automatycznie.`);
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3003;

// Upewnij się, że port jest dostępny przed uruchomieniem serwera
ensurePortAvailable(PORT);

// Konfiguracja CORS
app.use(cors({
  origin: '*', // Zezwalaj na dostęp z dowolnego źródła
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400 // 24 godziny
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logowanie żądań
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Obsługa plików statycznych
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Trasy
app.use('/api/baselinker', baselinkerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/allegro', allegroRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/csv', csvImportRoutes);

// Trasa główna
app.get('/', (req, res) => {
  res.json({ message: 'API działa poprawnie' });
});

// Obsługa błędów
app.use(errorHandler);

// Obsługa trasy, która nie istnieje
app.use((req, res) => {
  logger.warn(`Próba dostępu do nieistniejącego endpointu: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Endpoint nie istnieje' });
});

// Komenda do zwolnienia portu i restartu serwera
export function freePortAndRestart() {
  try {
    logger.info('Zwalnianie portu 3001...');
    if (process.platform === 'win32') {
      execSync('netstat -ano | findstr :3001').toString().split('\n').forEach(line => {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          try {
            execSync(`taskkill /F /PID ${match[1]}`);
            logger.info(`Zwolniono proces o PID ${match[1]}`);
          } catch (e) {}
        }
      });
    } else {
      execSync('lsof -i:3001 -t').toString().split('\n').forEach(pid => {
        if (pid) {
          try {
            execSync(`kill -9 ${pid}`);
            logger.info(`Zwolniono proces o PID ${pid}`);
          } catch (e) {}
        }
      });
    }
    logger.info('Restartowanie serwera...');
    require('child_process').spawn('npm', ['run', 'dev'], {
      detached: true,
      stdio: 'ignore'
    }).unref();
  } catch (e) {
    logger.error('Błąd podczas zwalniania portu:', e);
  }
}

// Uruchamianie serwera
try {
  const server = app.listen(PORT, () => {
    logger.info(`Serwer działa na porcie: ${PORT}`);
    logger.info(`Środowisko: ${process.env.NODE_ENV}`);
  });

  // Obsługa zamknięcia serwera
  process.on('SIGTERM', () => {
    logger.info('Otrzymano sygnał SIGTERM - zamykanie serwera');
    server.close(() => {
      logger.info('Serwer został zamknięty');
      process.exit(0);
    });
  });
} catch (error) {
  logger.error('Błąd podczas uruchamiania serwera:', error);
  process.exit(1);
}

export default app; 