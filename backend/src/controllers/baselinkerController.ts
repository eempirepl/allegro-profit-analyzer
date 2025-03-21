import { Request, Response } from 'express';
import { baseLinkerService } from '../services/baseLinkerService';
import { logger } from '../utils/logger';

// Kontroler BaseLinker
export const baseLinkerController = {
  // Pobieranie listy produktów
  async getProducts(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;
      const inventoryId = req.query.inventoryId as string;
      
      const products = await baseLinkerService.getProducts({ page, limit, inventoryId });
      res.json({ success: true, data: products });
    } catch (error) {
      logger.error('Błąd podczas pobierania produktów:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Wystąpił błąd podczas pobierania produktów' 
      });
    }
  },

  // Pobieranie szczegółów produktu
  async getProductDetails(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const inventoryId = req.query.inventoryId as string;

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Nie podano ID produktu'
        });
      }

      const product = await baseLinkerService.getProductDetails(productId, inventoryId);
      res.json({ success: true, data: product });
    } catch (error) {
      logger.error(`Błąd podczas pobierania szczegółów produktu ${req.params.productId}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Wystąpił błąd podczas pobierania szczegółów produktu' 
      });
    }
  },

  // Pobieranie listy zamówień
  async getOrders(req: Request, res: Response) {
    try {
      const dateFrom = req.query.dateFrom ? Number(req.query.dateFrom) : undefined;
      const dateTo = req.query.dateTo ? Number(req.query.dateTo) : undefined;
      const statusId = req.query.statusId ? Number(req.query.statusId) : undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;

      const orders = await baseLinkerService.getOrders({ dateFrom, dateTo, statusId, page, limit });
      res.json({ success: true, data: orders });
    } catch (error) {
      logger.error('Błąd podczas pobierania zamówień:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Wystąpił błąd podczas pobierania zamówień' 
      });
    }
  },

  // Pobieranie szczegółów zamówienia
  async getOrderDetails(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Nie podano ID zamówienia'
        });
      }

      const orderDetails = await baseLinkerService.getOrderDetails(orderId);
      res.json({ success: true, data: orderDetails });
    } catch (error) {
      logger.error(`Błąd podczas pobierania szczegółów zamówienia ${req.params.orderId}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Wystąpił błąd podczas pobierania szczegółów zamówienia' 
      });
    }
  },

  // Pobieranie pozycji zamówienia
  async getOrderItems(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Nie podano ID zamówienia'
        });
      }

      const items = await baseLinkerService.getOrderItems(orderId);
      res.json({ success: true, data: items });
    } catch (error) {
      logger.error(`Błąd podczas pobierania pozycji zamówienia ${req.params.orderId}:`, error);
      res.status(500).json({ 
        success: false, 
        error: 'Wystąpił błąd podczas pobierania pozycji zamówienia' 
      });
    }
  },

  // Synchronizacja danych
  async syncData(req: Request, res: Response) {
    try {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      const now = Math.floor(Date.now() / 1000);
      
      const data = await baseLinkerService.syncData(thirtyDaysAgo, now);
      res.json(data);
    } catch (error) {
      logger.error('Błąd podczas synchronizacji danych:', error);
      res.status(500).json({ error: 'Błąd podczas synchronizacji danych' });
    }
  },

  // Test połączenia
  async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await baseLinkerService.testConnection();
      res.json({ connected: isConnected });
    } catch (error) {
      logger.error('Błąd podczas testowania połączenia:', error);
      res.status(500).json({ error: 'Błąd podczas testowania połączenia' });
    }
  },

  // Pobieranie listy magazynów
  async getInventories(req: Request, res: Response) {
    try {
      const inventories = await baseLinkerService.getInventories();
      res.json({ success: true, data: inventories });
    } catch (error) {
      logger.error('Błąd podczas pobierania listy magazynów:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Błąd podczas pobierania listy magazynów' 
      });
    }
  },

  // Pobieranie szczegółów magazynu
  async getInventoryDetails(req: Request, res: Response) {
    try {
      const inventoryId = parseInt(req.params.id);
      const inventories = await baseLinkerService.getInventories();
      
      const inventory = inventories.find(inv => inv.inventory_id === inventoryId);
      
      if (!inventory) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nie znaleziono magazynu o podanym ID' 
        });
      }
      
      res.json({ 
        success: true, 
        data: inventory 
      });
    } catch (error) {
      logger.error('Błąd podczas pobierania szczegółów magazynu:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas pobierania szczegółów magazynu' 
      });
    }
  }
}; 