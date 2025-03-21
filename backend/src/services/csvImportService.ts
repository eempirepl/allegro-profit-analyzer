import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { logger } from '../utils/logger';
import { prisma } from '../config/db';
import { Order } from '@prisma/client';

interface CSVRow {
  order_id: string;
  allegro_fee?: string;
  shipping_fee?: string;
  payment_fee?: string;
}

interface ImportResult {
  processed: number;
  updated: number;
  errors: number;
}

class CSVImportService {
  // Import pliku CSV Allegro Billing
  async importCSV(filePath: string): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const results: CSVRow[] = [];
      const parser = parse({
        delimiter: ',',
        columns: true,
        skip_empty_lines: true
      });

      createReadStream(filePath)
        .pipe(parser)
        .on('data', (data: CSVRow) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            const importResult = await this.processCSVData(results);
            resolve(importResult);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }

  // Przetwarzanie danych z CSV
  private async processCSVData(data: CSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      processed: 0,
      updated: 0,
      errors: 0
    };

    for (const row of data) {
      try {
        // Najpierw sprawdzamy, czy order_id istnieje
        if (!row.order_id) {
          logger.warn('Pominięto wiersz bez order_id');
          result.errors++;
          continue;
        }

        const orders = await prisma.order.findMany({
          where: { 
            externalId: row.order_id 
          },
          take: 1
        });

        const order = orders[0];

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              allegro_fee: parseFloat(row.allegro_fee || '0'),
              shipping_fee: parseFloat(row.shipping_fee || '0'),
              payment_fee: parseFloat(row.payment_fee || '0')
            }
          });
          result.updated++;
        } else {
          logger.warn(`Nie znaleziono zamówienia o ID: ${row.order_id}`);
        }

        result.processed++;
      } catch (error) {
        logger.error(`Błąd podczas przetwarzania wiersza CSV:`, error);
        result.errors++;
      }
    }

    logger.info(`Import CSV zakończony. Przetworzono: ${result.processed}, Zaktualizowano: ${result.updated}, Błędy: ${result.errors}`);
    return result;
  }
}

export const csvImportService = new CSVImportService(); 