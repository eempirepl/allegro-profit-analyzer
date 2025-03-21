import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';

// Pobierz wszystkie zamówienia
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    });
    
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Błąd podczas pobierania zamówień:', error);
    res.status(500).json({ message: 'Nie udało się pobrać zamówień' });
  }
};

// Pobierz zamówienie po ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      res.status(404).json({ message: 'Zamówienie nie zostało znalezione' });
      return;
    }
    
    res.status(200).json(order);
  } catch (error) {
    logger.error(`Błąd podczas pobierania zamówienia o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się pobrać zamówienia' });
  }
};

// Utwórz nowe zamówienie
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      externalId, 
      orderNumber, 
      status, 
      orderDate, 
      shippingCost,
      discountAmount,
      totalAmount,
      customer_id,
      items
    } = req.body;
    
    const order = await prisma.order.create({
      data: {
        externalId,
        orderNumber,
        status,
        orderDate: new Date(orderDate),
        shippingCost,
        discountAmount,
        totalAmount,
        customer_id,
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            externalId: item.externalId,
            productId: item.productId,
            purchasePrice: item.purchasePrice
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    logger.error('Błąd podczas tworzenia zamówienia:', error);
    res.status(500).json({ message: 'Nie udało się utworzyć zamówienia' });
  }
};

// Zaktualizuj zamówienie
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      externalId, 
      orderNumber, 
      status, 
      orderDate, 
      shippingCost,
      discountAmount,
      totalAmount,
      customer_id
    } = req.body;
    
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        externalId,
        orderNumber,
        status,
        orderDate: orderDate ? new Date(orderDate) : undefined,
        shippingCost,
        discountAmount,
        totalAmount,
        customer_id
      }
    });
    
    res.status(200).json(order);
  } catch (error) {
    logger.error(`Błąd podczas aktualizacji zamówienia o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się zaktualizować zamówienia' });
  }
};

// Usuń zamówienie
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await prisma.order.delete({
      where: { id: Number(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    logger.error(`Błąd podczas usuwania zamówienia o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się usunąć zamówienia' });
  }
};

// Pobierz rentowność zamówienia
export const getOrderProfitability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      res.status(404).json({ message: 'Zamówienie nie zostało znalezione' });
      return;
    }
    
    // Obliczanie kosztów produktów
    let productCost = 0;
    for (const item of order.items) {
      const purchasePrice = item.purchasePrice || item.product?.purchasePrice || 0;
      productCost += purchasePrice * item.quantity;
    }
    
    // Obliczanie zysku
    const revenue = order.totalAmount;
    const shippingCost = order.shippingCost || 0;
    const allegro_fee = order.allegro_fee || 0;
    const payment_fee = order.payment_fee || 0;
    const shipping_fee = order.shipping_fee || 0;
    
    const totalExpenses = productCost + allegro_fee + payment_fee + shipping_fee;
    const profit = revenue - totalExpenses;
    const profitMargin = (profit / revenue) * 100;
    
    res.status(200).json({
      orderId: order.id,
      revenue,
      expenses: {
        productCost,
        allegro_fee,
        payment_fee,
        shipping_fee,
        totalExpenses
      },
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100, // zaokrąglenie do 2 miejsc po przecinku
      shippingCost
    });
  } catch (error) {
    logger.error(`Błąd podczas pobierania rentowności zamówienia o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się pobrać rentowności zamówienia' });
  }
}; 