import { Request, Response } from 'express';
import { csvImportService } from '../services/csvImportService';
import { logger } from '../utils/logger';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

class CSVImportController {
  async importCSV(req: MulterRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nie przesłano pliku' 
        });
      }

      const result = await csvImportService.importCSV(req.file.path);
      
      return res.status(200).json({
        success: true,
        message: 'Import CSV zakończony pomyślnie',
        data: result
      });

    } catch (error) {
      logger.error('Błąd podczas importu CSV:', error);
      return res.status(500).json({
        success: false,
        message: 'Wystąpił błąd podczas importu CSV',
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      });
    }
  }
}

export const csvImportController = new CSVImportController(); 