import { Request, Response } from 'express';
import { dataSyncService } from '../services/dataSyncService';
import { logger } from '../utils/logger';

export const syncController = {
  // Synchronizacja produktów
  async syncProducts(req: Request, res: Response) {
    try {
      // Inicjujemy odpowiedź jako odpowiedź strumieniową
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Informujemy o rozpoczęciu synchronizacji
      res.write(`data: ${JSON.stringify({ status: 'start', message: 'Rozpoczęcie synchronizacji produktów' })}\n\n`);

      // Wykonujemy synchronizację
      const result = await dataSyncService.syncProducts();

      // Informujemy o zakończeniu synchronizacji
      res.write(`data: ${JSON.stringify({ 
        status: 'complete', 
        message: 'Synchronizacja produktów zakończona pomyślnie', 
        stats: result
      })}\n\n`);
      
      res.end();
    } catch (error) {
      logger.error('Błąd podczas synchronizacji produktów:', error);
      
      // W przypadku błędu również informujemy klienta
      res.write(`data: ${JSON.stringify({ 
        status: 'error', 
        message: 'Błąd podczas synchronizacji produktów', 
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      })}\n\n`);
      
      res.end();
    }
  },

  // Synchronizacja zamówień
  async syncOrders(req: Request, res: Response) {
    try {
      const dateFrom = req.query.dateFrom ? Number(req.query.dateFrom) : Math.floor(Date.now() / 1000) - 86400 * 30; // domyślnie ostatnie 30 dni
      const dateTo = req.query.dateTo ? Number(req.query.dateTo) : Math.floor(Date.now() / 1000);

      // Inicjujemy odpowiedź jako odpowiedź strumieniową
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Informujemy o rozpoczęciu synchronizacji
      res.write(`data: ${JSON.stringify({ status: 'start', message: 'Rozpoczęcie synchronizacji zamówień' })}\n\n`);

      // Wykonujemy synchronizację
      const result = await dataSyncService.syncOrders(dateFrom, dateTo);

      // Informujemy o zakończeniu synchronizacji
      res.write(`data: ${JSON.stringify({ 
        status: 'complete', 
        message: 'Synchronizacja zamówień zakończona pomyślnie', 
        stats: result
      })}\n\n`);
      
      res.end();
    } catch (error) {
      logger.error('Błąd podczas synchronizacji zamówień:', error);
      
      // W przypadku błędu również informujemy klienta
      res.write(`data: ${JSON.stringify({ 
        status: 'error', 
        message: 'Błąd podczas synchronizacji zamówień', 
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      })}\n\n`);
      
      res.end();
    }
  },

  // Pełna synchronizacja
  async syncAll(req: Request, res: Response) {
    try {
      const dateFrom = req.query.dateFrom ? Number(req.query.dateFrom) : Math.floor(Date.now() / 1000) - 86400 * 30; // domyślnie ostatnie 30 dni
      const dateTo = req.query.dateTo ? Number(req.query.dateTo) : Math.floor(Date.now() / 1000);

      // Inicjujemy odpowiedź jako odpowiedź strumieniową
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Informujemy o rozpoczęciu synchronizacji
      res.write(`data: ${JSON.stringify({ status: 'start', message: 'Rozpoczęcie pełnej synchronizacji danych' })}\n\n`);

      // Wykonujemy synchronizację
      const result = await dataSyncService.syncAll(dateFrom, dateTo);

      // Informujemy o zakończeniu synchronizacji
      res.write(`data: ${JSON.stringify({ 
        status: 'complete', 
        message: 'Pełna synchronizacja danych zakończona pomyślnie', 
        stats: result
      })}\n\n`);
      
      res.end();
    } catch (error) {
      logger.error('Błąd podczas pełnej synchronizacji:', error);
      
      // W przypadku błędu również informujemy klienta
      res.write(`data: ${JSON.stringify({ 
        status: 'error', 
        message: 'Błąd podczas pełnej synchronizacji danych', 
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      })}\n\n`);
      
      res.end();
    }
  }
}; 