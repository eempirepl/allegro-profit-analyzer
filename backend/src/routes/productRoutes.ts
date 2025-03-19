import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';

const router = Router();

// Pobierz wszystkie produkty
router.get('/', getProducts);

// Pobierz jeden produkt według ID
router.get('/:id', getProductById);

// Utwórz nowy produkt
router.post('/', createProduct);

// Zaktualizuj produkt
router.put('/:id', updateProduct);

// Usuń produkt
router.delete('/:id', deleteProduct);

export const productRoutes = router; 