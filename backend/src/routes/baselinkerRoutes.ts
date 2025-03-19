import { Router } from 'express';
import { 
  getBaselinkerData, 
  syncBaselinkerData 
} from '../controllers/baselinkerController';

const router = Router();

// Pobierz dane z BaseLinker
router.get('/data', getBaselinkerData);

// Synchronizuj dane z BaseLinker
router.post('/sync', syncBaselinkerData);

export const baselinkerRoutes = router; 