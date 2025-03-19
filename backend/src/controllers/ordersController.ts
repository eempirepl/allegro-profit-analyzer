import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import baseLinkerService from '../services/baseLinkerService';

/**
 * Pobiera listę zamówień
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
    const dateFrom = parseInt(req.query.date_from as string) || 0; // od początku czasu (1970-01-01)
    const dateTo = parseInt(req.query.date_to as string) || Math.floor(Date.now() / 1000);
    const page = parseInt(req.query.page as string) || 1;
    
    logger.info(`Pobieranie zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}, page=${page}`);
    
    // Pobieranie zamówień z BaseLinker
    const ordersData = await baseLinkerService.getOrders(dateFrom, dateTo, page);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Mapuj zamówienia do formatu oczekiwanego przez frontend
    const orders = (ordersData.orders || []).map((order: any) => {
      // Oblicz wartość zamówienia
      const orderValue = baseLinkerService.calculateOrderValue(order);
      
      // Oblicz wartość w PLN
      const currency = order.currency || 'PLN';
      const rate = exchangeRates[currency] || 1.0;
      const valueInPLN = orderValue * (currency === 'PLN' ? 1 : rate);
      
      return {
        order_id: order.order_id,
        order_status_id: order.order_status_id,
        order_source: order.order_source,
        delivery_fullname: order.delivery_fullname,
        user_login: order.user_login,
        order_value: orderValue.toFixed(2),
        delivery_price: parseFloat(order.delivery_price || 0).toFixed(2),
        date_add: new Date(order.date_add * 1000).toISOString(),
        currency: currency,
        value_in_pln: valueInPLN.toFixed(2),
        external_order_id: order.external_order_id || ''
      };
    });
    
    logger.info(`Pobrano ${orders.length} zamówień`);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania zamówień: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania zamówień',
      details: error.message || String(error)
    });
  }
};

/**
 * Pobiera szczegóły zamówienia
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Nie podano ID zamówienia'
      });
    }
    
    logger.info(`Pobieranie szczegółów zamówienia: orderId=${orderId}`);
    
    // Pobieranie szczegółów zamówienia z BaseLinker
    const orderData = await baseLinkerService.getOrderDetails(orderId);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Oblicz wartości
    const currency = orderData.order_currency || 'PLN';
    const rate = exchangeRates[currency] || 1.0;
    
    // Mapuj pozycje zamówienia
    const products = (orderData.products || []).map((product: any) => {
      const price = parseFloat(product.price_brutto) || 0;
      const quantity = parseInt(product.quantity) || 0;
      const totalPrice = price * quantity;
      const valueInPLN = totalPrice * (currency === 'PLN' ? 1 : rate);
      
      return {
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
    
    logger.info(`Pobrano szczegóły zamówienia ${orderId} z ${products.length} pozycjami`);
    
    res.status(200).json({
      success: true,
      order: {
        order_id: orderData.order_id,
        order_status_id: orderData.order_status_id,
        date_add: new Date(orderData.date_add * 1000).toISOString(),
        user_login: orderData.user_login,
        phone: orderData.phone,
        email: orderData.email,
        user_comments: orderData.user_comments,
        admin_comments: orderData.admin_comments,
        currency: currency,
        payment_method: orderData.payment_method,
        payment_method_cod: orderData.payment_method_cod,
        payment_done: orderData.payment_done,
        delivery_method: orderData.delivery_method,
        delivery_price: orderData.delivery_price,
        delivery_fullname: orderData.delivery_fullname,
        delivery_company: orderData.delivery_company,
        delivery_address: orderData.delivery_address,
        delivery_city: orderData.delivery_city,
        delivery_postcode: orderData.delivery_postcode,
        delivery_country: orderData.delivery_country,
        invoice_fullname: orderData.invoice_fullname,
        invoice_company: orderData.invoice_company,
        invoice_nip: orderData.invoice_nip,
        invoice_address: orderData.invoice_address,
        invoice_city: orderData.invoice_city,
        invoice_postcode: orderData.invoice_postcode,
        invoice_country: orderData.invoice_country,
        want_invoice: orderData.want_invoice,
        extra_field_1: orderData.extra_field_1,
        extra_field_2: orderData.extra_field_2,
        order_page: orderData.order_page,
        products: products
      }
    });
  } catch (error: any) {
    logger.error(`Błąd podczas pobierania szczegółów zamówienia: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas pobierania szczegółów zamówienia',
      details: error.message || String(error)
    });
  }
};

/**
 * Synchronizuje zamówienia z BaseLinker
 */
export const syncOrders = async (req: Request, res: Response) => {
  try {
    // Ustawiam datę początkową na bardzo odległą przeszłość, aby pobrać wszystkie zamówienia
    const dateFrom = parseInt(req.query.date_from as string) || 0; // od początku czasu (1970-01-01)
    const dateTo = parseInt(req.query.date_to as string) || Math.floor(Date.now() / 1000);
    
    logger.info(`Rozpoczęcie synchronizacji zamówień: dateFrom=${dateFrom}, dateTo=${dateTo}`);
    
    // Pobieranie zamówień z BaseLinker
    const ordersData = await baseLinkerService.getOrders(dateFrom, dateTo);
    
    // Pobierz kursy walut
    const exchangeRates = await baseLinkerService.getExchangeRates();
    
    // Mapuj zamówienia do formatu oczekiwanego przez frontend
    const orders = (ordersData.orders || []).map((order: any) => {
      // Oblicz wartość zamówienia
      const orderValue = baseLinkerService.calculateOrderValue(order);
      
      // Oblicz wartość w PLN
      const currency = order.currency || 'PLN';
      const rate = exchangeRates[currency] || 1.0;
      const valueInPLN = orderValue * (currency === 'PLN' ? 1 : rate);
      
      return {
        order_id: order.order_id,
        order_status_id: order.order_status_id,
        order_source: order.order_source,
        delivery_fullname: order.delivery_fullname,
        user_login: order.user_login,
        order_value: orderValue.toFixed(2),
        delivery_price: parseFloat(order.delivery_price || 0).toFixed(2),
        date_add: new Date(order.date_add * 1000).toISOString(),
        currency: currency,
        value_in_pln: valueInPLN.toFixed(2),
        external_order_id: order.external_order_id || ''
      };
    });
    
    logger.info(`Zsynchronizowano ${orders.length} zamówień`);
    
    res.status(200).json({
      success: true,
      message: `Zsynchronizowano ${orders.length} zamówień`,
      count: orders.length,
      orders: orders
    });
  } catch (error: any) {
    logger.error(`Błąd podczas synchronizacji zamówień: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: 'Błąd podczas synchronizacji zamówień',
      details: error.message || String(error)
    });
  }
};

export default {
  getOrders,
  getOrderDetails,
  syncOrders
}; 