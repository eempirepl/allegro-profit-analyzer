"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvImportService = void 0;
const csv_parse_1 = require("csv-parse");
const fs_1 = require("fs");
const logger_1 = require("../utils/logger");
const db_1 = require("../config/db");
class CSVImportService {
    // Import pliku CSV Allegro Billing
    async importCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            const parser = (0, csv_parse_1.parse)({
                delimiter: ',',
                columns: true,
                skip_empty_lines: true
            });
            (0, fs_1.createReadStream)(filePath)
                .pipe(parser)
                .on('data', (data) => {
                results.push(data);
            })
                .on('end', async () => {
                try {
                    const importResult = await this.processCSVData(results);
                    resolve(importResult);
                }
                catch (error) {
                    reject(error);
                }
            })
                .on('error', (error) => {
                reject(error);
            });
        });
    }
    // Przetwarzanie danych z CSV
    async processCSVData(data) {
        const result = {
            processed: 0,
            updated: 0,
            errors: 0
        };
        for (const row of data) {
            try {
                // Najpierw sprawdzamy, czy order_id istnieje
                if (!row.order_id) {
                    logger_1.logger.warn('Pominięto wiersz bez order_id');
                    result.errors++;
                    continue;
                }
                const orders = await db_1.prisma.order.findMany({
                    where: {
                        externalId: row.order_id
                    },
                    take: 1
                });
                const order = orders[0];
                if (order) {
                    await db_1.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            allegro_fee: parseFloat(row.allegro_fee || '0'),
                            shipping_fee: parseFloat(row.shipping_fee || '0'),
                            payment_fee: parseFloat(row.payment_fee || '0')
                        }
                    });
                    result.updated++;
                }
                else {
                    logger_1.logger.warn(`Nie znaleziono zamówienia o ID: ${row.order_id}`);
                }
                result.processed++;
            }
            catch (error) {
                logger_1.logger.error(`Błąd podczas przetwarzania wiersza CSV:`, error);
                result.errors++;
            }
        }
        logger_1.logger.info(`Import CSV zakończony. Przetworzono: ${result.processed}, Zaktualizowano: ${result.updated}, Błędy: ${result.errors}`);
        return result;
    }
}
exports.csvImportService = new CSVImportService();
