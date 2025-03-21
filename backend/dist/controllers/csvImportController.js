"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvImportController = void 0;
const csvImportService_1 = require("../services/csvImportService");
const logger_1 = require("../utils/logger");
class CSVImportController {
    async importCSV(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Nie przesłano pliku'
                });
            }
            const result = await csvImportService_1.csvImportService.importCSV(req.file.path);
            return res.status(200).json({
                success: true,
                message: 'Import CSV zakończony pomyślnie',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Błąd podczas importu CSV:', error);
            return res.status(500).json({
                success: false,
                message: 'Wystąpił błąd podczas importu CSV',
                error: error instanceof Error ? error.message : 'Nieznany błąd'
            });
        }
    }
}
exports.csvImportController = new CSVImportController();
