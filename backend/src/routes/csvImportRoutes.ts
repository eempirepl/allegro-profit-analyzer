import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { csvImportController } from '../controllers/csvImportController';
import { Request } from 'express';

const router = Router();

// Konfiguracja multer dla obsługi plików CSV
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Tylko pliki CSV są dozwolone'));
    }
  }
});

// Endpoint do importu CSV
router.post('/import', upload.single('file'), csvImportController.importCSV);

export default router; 