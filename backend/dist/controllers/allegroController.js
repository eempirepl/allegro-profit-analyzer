"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllegroFees = exports.importCsvData = void 0;
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
// Funkcja importująca dane z CSV Allegro Billing
const importCsvData = async (req, res) => {
    try {
        // TODO: Implementacja importu danych z CSV
        // Należy obsłużyć przesyłanie pliku, parsowanie i zapis do bazy danych
        // Ten kod to tylko szkielet - przykład do zastąpienia rzeczywistą implementacją
        const { data } = req.body;
        if (!data || data.length === 0) {
            res.status(400).json({ message: 'Brak danych do importu' });
            return;
        }
        logger_1.logger.info(`Rozpoczęto import ${data.length} rekordów CSV`);
        // Symulacja opóźnienia przetwarzania
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.status(200).json({
            message: 'Dane zaimportowane pomyślnie',
            imported: data.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas importu danych CSV:', error);
        res.status(500).json({ message: 'Nie udało się zaimportować danych CSV' });
    }
};
exports.importCsvData = importCsvData;
// Pobierz opłaty Allegro
const getAllegroFees = async (req, res) => {
    try {
        const fees = await db_1.prisma.allegroFee.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(fees);
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas pobierania opłat Allegro:', error);
        res.status(500).json({ message: 'Nie udało się pobrać opłat Allegro' });
    }
};
exports.getAllegroFees = getAllegroFees;
