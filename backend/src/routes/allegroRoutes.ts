import { Router } from 'express';
import { 
  importCsvData, 
  getAllegroFees 
} from '../controllers/allegroController';

const router = Router();

// Import danych z CSV Allegro Billing
router.post('/import-csv', importCsvData);

// Pobierz opłaty Allegro
router.get('/fees', getAllegroFees);

export const allegroRoutes = router; 