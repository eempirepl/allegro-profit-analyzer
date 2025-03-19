import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import baseLinkerService from '../services/baseLinkerService';

/**
 * Pobiera wszystkie produkty magazynowe
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.query.inventory_id as string || '33644';
    
    logger.info(`Pobieranie produktów magazynowych z inventoryId=${inventoryId}`);
    
    // Pobieranie wszystkich produktów z obsługą paginacji
    const productsData = await baseLinkerService.getAllInventoryProducts(inventoryId);
    
    // Mapowanie danych produktów do formatu oczekiwanego przez frontend
    const products = Object.entries(productsData.products || {}).map(([productId, product]: [string, any]) => {
      return {
        id: parseInt(productId),
        sku: product.sku || '',
        ean: product.ean || '',
        name: product.text_fields?.name || '',
        average_cost: product.average_cost || null,
        stock: baseLinkerService.calculateTotalStock(product),
      };
    });
    
    logger.info(`Pobrano ${products.length} produktów magazynowych`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania produktów magazynowych: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania produktów magazynowych',
      details: error.message || String(error)
    });
  }
};

/**
 * Synchronizuje produkty magazynowe z BaseLinker
 */
export const syncProducts = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.query.inventory_id as string || '33644';
    
    logger.info(`Rozpoczęcie synchronizacji produktów magazynowych z inventoryId=${inventoryId}`);
    
    // Pobieranie wszystkich produktów
    const productsData = await baseLinkerService.getAllInventoryProducts(inventoryId);
    
    // Mapowanie danych produktów
    const products = Object.entries(productsData.products || {}).map(([productId, product]: [string, any]) => {
      return {
        id: parseInt(productId),
        sku: product.sku || '',
        ean: product.ean || '',
        name: product.text_fields?.name || '',
        average_cost: product.average_cost || null,
        stock: baseLinkerService.calculateTotalStock(product),
      };
    });
    
    logger.info(`Zsynchronizowano ${products.length} produktów magazynowych`);
    
    res.status(200).json({
      success: true,
      message: `Zsynchronizowano ${products.length} produktów magazynowych`,
      count: products.length,
      products: products
    });
  } catch (error: any) {
    logger.error(`Błąd podczas synchronizacji produktów magazynowych: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas synchronizacji produktów magazynowych',
      details: error.message || String(error)
    });
  }
};

export default {
  getProducts,
  syncProducts
}; 