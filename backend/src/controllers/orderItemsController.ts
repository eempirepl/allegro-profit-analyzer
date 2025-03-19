import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import baseLinkerService from '../services/baseLinkerService';

/**
 * Pobiera pozycje zamówienia
 */
export const getOrderItems = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Nie podano ID zamówienia'
      });
    }
    
    logger.info(`Pobieranie pozycji zamówienia: orderId=${orderId}`);
    
    // Pobieranie szczegółów zamówienia
    const orderData = await baseLinkerService.getOrderDetails(orderId);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Mapuj pozycje zamówienia
    const currency = orderData.order_currency || 'PLN';
    const rate = exchangeRates[currency] || 1.0;
    
    const orderItems = (orderData.products || []).map((product: any) => {
      const price = parseFloat(product.price_brutto) || 0;
      const quantity = parseInt(product.quantity) || 0;
      const totalPrice = price * quantity;
      const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
      
      return {
        order_id: orderId,
        product_id: product.product_id,
        name: product.name,
        price_brutto: price.toFixed(2),
        tax_rate: product.tax_rate,
        quantity: quantity,
        currency: currency,
        value_in_pln: valueInPLN.toFixed(2),
        auction_id: product.auction_id || ''
      };
    });
    
    logger.info(`Pobrano ${orderItems.length} pozycji zamówienia ${orderId}`);
    
    res.status(200).json({
      success: true,
      count: orderItems.length,
      order_items: orderItems
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania pozycji zamówienia: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania pozycji zamówienia',
      details: error.message || String(error)
    });
  }
};

/**
 * Pobiera wszystkie pozycje zamówień
 */
export const getAllOrderItems = async (req: Request, res: Response) => {
  try {
    // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
    const dateFrom = parseInt(req.query.date_from as string) || 0; // od początku czasu (1970-01-01)
    const dateTo = parseInt(req.query.date_to as string) || Math.floor(Date.now() / 1000);
    
    logger.info(`Pobieranie wszystkich pozycji zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}`);
    
    // Pobieranie zamówień
    const ordersData = await baseLinkerService.getOrders(dateFrom, dateTo);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Kolekcja wszystkich pozycji zamówień
    let allOrderItems: any[] = [];
    
    // Dla każdego zamówienia pobierz szczegóły i wyodrębnij pozycje
    for (const order of ordersData.orders || []) {
      try {
        const orderDetails = await baseLinkerService.getOrderDetails(order.order_id);
        
        const currency = orderDetails.order_currency || 'PLN';
        const rate = exchangeRates[currency] || 1.0;
        
        const orderItems = (orderDetails.products || []).map((product: any) => {
          const price = parseFloat(product.price_brutto) || 0;
          const quantity = parseInt(product.quantity) || 0;
          const totalPrice = price * quantity;
          const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
          
          return {
            order_id: order.order_id,
            product_id: product.product_id,
            name: product.name,
            price_brutto: price.toFixed(2),
            tax_rate: product.tax_rate,
            quantity: quantity,
            currency: currency,
            value_in_pln: valueInPLN.toFixed(2),
            auction_id: product.auction_id || ''
          };
        });
        
        allOrderItems = [...allOrderItems, ...orderItems];
      } catch (error: any) {
        logger.error(`Błąd podczas pobierania szczegółów zamówienia ${order.order_id}: ${error.message || error}`);
        // Kontynuuj mimo błędu
      }
    }
    
    logger.info(`Pobrano łącznie ${allOrderItems.length} pozycji zamówień`);
    
    res.status(200).json({
      success: true,
      count: allOrderItems.length,
      order_items: allOrderItems
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania wszystkich pozycji zamówień: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania wszystkich pozycji zamówień',
      details: error.message || String(error)
    });
  }
};

/**
 * Synchronizuje pozycje zamówień z BaseLinker
 */
export const syncOrderItems = async (req: Request, res: Response) => {
  try {
    // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
    const dateFrom = parseInt(req.query.date_from as string) || 0; // od początku czasu (1970-01-01)
    const dateTo = parseInt(req.query.date_to as string) || Math.floor(Date.now() / 1000);
    
    logger.info(`Rozpoczęcie synchronizacji pozycji zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}`);
    
    // Pobieranie zamówień
    const ordersData = await baseLinkerService.getOrders(dateFrom, dateTo);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Kolekcja wszystkich pozycji zamówień
    let allOrderItems: any[] = [];
    
    // Dla każdego zamówienia pobierz szczegóły i wyodrębnij pozycje
    for (const order of ordersData.orders || []) {
      try {
        const orderDetails = await baseLinkerService.getOrderDetails(order.order_id);
        
        const currency = orderDetails.order_currency || 'PLN';
        const rate = exchangeRates[currency] || 1.0;
        
        const orderItems = (orderDetails.products || []).map((product: any) => {
          const price = parseFloat(product.price_brutto) || 0;
          const quantity = parseInt(product.quantity) || 0;
          const totalPrice = price * quantity;
          const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
          
          return {
            order_id: order.order_id,
            product_id: product.product_id,
            name: product.name,
            price_brutto: price.toFixed(2),
            tax_rate: product.tax_rate,
            quantity: quantity,
            currency: currency,
            value_in_pln: valueInPLN.toFixed(2),
            auction_id: product.auction_id || ''
          };
        });
        
        allOrderItems = [...allOrderItems, ...orderItems];
      } catch (error: any) {
        logger.error(`Błąd podczas pobierania szczegółów zamówienia ${order.order_id}: ${error.message || error}`);
        // Kontynuuj mimo błędu
      }
    }
    
    logger.info(`Zsynchronizowano łącznie ${allOrderItems.length} pozycji zamówień`);
    
    res.status(200).json({
      success: true,
      message: `Zsynchronizowano ${allOrderItems.length} pozycji zamówień`,
      count: allOrderItems.length,
      order_items: allOrderItems
    });
  } catch (error: any) {
    logger.error(`Błąd podczas synchronizacji pozycji zamówień: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas synchronizacji pozycji zamówień',
      details: error.message || String(error)
    });
  }
};

export default {
  getOrderItems,
  getAllOrderItems,
  syncOrderItems
}; 