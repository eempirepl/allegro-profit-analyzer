import { Router } from 'express';
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrderProfitability
} from '../controllers/orderController';

const router = Router();

// Pobierz wszystkie zamówienia
router.get('/', getOrders);

// Pobierz zamówienie według ID
router.get('/:id', getOrderById);

// Utwórz nowe zamówienie
router.post('/', createOrder);

// Zaktualizuj zamówienie
router.put('/:id', updateOrder);

// Usuń zamówienie
router.delete('/:id', deleteOrder);

// Pobierz rentowność zamówienia
router.get('/:id/profitability', getOrderProfitability);

export const orderRoutes = router; 