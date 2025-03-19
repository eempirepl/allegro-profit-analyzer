import { createLogger, format, transports } from 'winston';
import path from 'path';

// Konfiguracja lokalizacji plików logów
const logDir = path.join(__dirname, '../../logs');

// Konfiguracja formatu logów
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Tworzenie loggera z konfiguracją
export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'allegro-profit-analyzer' },
  transports: [
    // Zapisywanie wszystkich logów do pliku combined.log
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      level: 'info' 
    }),
    
    // Zapisywanie logów błędów do pliku error.log
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error' 
    }),
    
    // Wyświetlanie wszystkich logów w konsoli w środowisku deweloperskim
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    })
  ],
  // Obsługa wyjątków niezłapanych
  exceptionHandlers: [
    new transports.File({ 
      filename: path.join(logDir, 'exceptions.log') 
    })
  ]
});

export default logger; 