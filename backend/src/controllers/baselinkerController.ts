import { Request, Response } from 'express';
import baseLinkerService from '../services/baseLinkerService';
import { logger } from '../utils/logger';

/**
 * Pobiera listę produktów z BaseLinker
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.query.inventoryId as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const productsData = await baseLinkerService.getProducts(inventoryId, page, limit);
    
    return res.status(200).json({
      success: true,
      data: productsData,
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania produktów: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania produktów',
      message: error.message,
    });
  }
};

/**
 * Pobiera szczegóły produktu z BaseLinker
 */
export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const inventoryId = req.query.inventoryId as string | undefined;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Nie podano ID produktu',
      });
    }

    const productDetails = await baseLinkerService.getProductDetails(productId, inventoryId);
    
    return res.status(200).json({
      success: true,
      data: productDetails,
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania szczegółów produktu: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania szczegółów produktu',
      message: error.message,
    });
  }
};

/**
 * Pobiera listę zamówień z BaseLinker
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom ? parseInt(req.query.dateFrom as string) : Math.floor(Date.now() / 1000) - 86400 * 30; // domyślnie ostatnie 30 dni
    const dateTo = req.query.dateTo ? parseInt(req.query.dateTo as string) : Math.floor(Date.now() / 1000);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const ordersData = await baseLinkerService.getOrders(dateFrom, dateTo, page, limit);
    
    return res.status(200).json({
      success: true,
      data: ordersData,
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania zamówień: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania zamówień',
      message: error.message,
    });
  }
};

/**
 * Pobiera szczegóły zamówienia z BaseLinker
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Nie podano ID zamówienia',
      });
    }

    const orderDetails = await baseLinkerService.getOrderDetails(orderId);
    
    return res.status(200).json({
      success: true,
      data: orderDetails,
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania szczegółów zamówienia: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania szczegółów zamówienia',
      message: error.message,
    });
  }
};

/**
 * Pobiera listę pozycji zamówienia z BaseLinker
 */
export const getOrderItems = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Nie podano ID zamówienia',
      });
    }

    const orderItems = await baseLinkerService.getOrderItems(orderId);
    
    return res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania pozycji zamówienia: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania pozycji zamówienia',
      message: error.message,
    });
  }
};

/**
 * Synchronizuje dane z BaseLinker
 */
export const syncData = async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom ? parseInt(req.query.dateFrom as string) : Math.floor(Date.now() / 1000) - 86400 * 30; // domyślnie ostatnie 30 dni
    const dateTo = req.query.dateTo ? parseInt(req.query.dateTo as string) : Math.floor(Date.now() / 1000);

    // Inicjujemy odpowiedź jako odpowiedź strumieniową
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Informujemy o rozpoczęciu synchronizacji
    res.write(`data: ${JSON.stringify({ status: 'start', message: 'Rozpoczęcie synchronizacji danych z BaseLinker' })}\n\n`);

    // Wykonujemy synchronizację (proces może być długotrwały)
    const syncResult = await baseLinkerService.syncBaseLinkerData(dateFrom, dateTo);

    // Informujemy o zakończeniu synchronizacji
    res.write(`data: ${JSON.stringify({ 
      status: 'complete', 
      message: 'Synchronizacja danych z BaseLinker zakończona pomyślnie', 
      stats: {
        products: syncResult.products.length,
        orders: syncResult.orders.length,
        orderItems: syncResult.orderItems.length
      }
    })}\n\n`);
    
    res.end();
  } catch (error: any) {
    logger.error(`Błąd podczas synchronizacji danych z BaseLinker: ${error.message}`);
    
    // W przypadku błędu również informujemy klienta
    res.write(`data: ${JSON.stringify({ 
      status: 'error', 
      message: 'Błąd podczas synchronizacji danych z BaseLinker', 
      error: error.message 
    })}\n\n`);
    
    res.end();
  }
};

export default {
  getProducts,
  getProductDetails,
  getOrders,
  getOrderDetails,
  getOrderItems,
  syncData
}; 