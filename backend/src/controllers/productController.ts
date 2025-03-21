import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { logger } from '../utils/logger';
import { baseLinkerService } from '../services/baseLinkerService';

// Pobierz wszystkie produkty
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    logger.error('Błąd podczas pobierania produktów:', error);
    res.status(500).json({ message: 'Nie udało się pobrać produktów' });
  }
};

// Pobierz produkt po ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    
    if (!product) {
      res.status(404).json({ message: 'Produkt nie został znaleziony' });
      return;
    }
    
    res.status(200).json(product);
  } catch (error) {
    logger.error(`Błąd podczas pobierania produktu o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się pobrać produktu' });
  }
};

// Utwórz nowy produkt
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sku, ean, purchasePrice, allegro_category_id, allegro_seller_id } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        ean,
        purchasePrice,
        allegro_category_id,
        allegro_seller_id
      },
    });
    
    res.status(201).json(product);
  } catch (error) {
    logger.error('Błąd podczas tworzenia produktu:', error);
    res.status(500).json({ message: 'Nie udało się utworzyć produktu' });
  }
};

// Zaktualizuj produkt
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, sku, ean, purchasePrice, allegro_category_id, allegro_seller_id } = req.body;
    
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        sku,
        ean,
        purchasePrice,
        allegro_category_id,
        allegro_seller_id
      },
    });
    
    res.status(200).json(product);
  } catch (error) {
    logger.error(`Błąd podczas aktualizacji produktu o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się zaktualizować produktu' });
  }
};

// Usuń produkt
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    logger.error(`Błąd podczas usuwania produktu o ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Nie udało się usunąć produktu' });
  }
};

// Synchronizuj produkty z BaseLinker
export const syncProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Rozpoczęcie synchronizacji produktów z BaseLinker');
    
    // Pobierz produkty z BaseLinker
    const baseLinkerProducts = await baseLinkerService.getProducts({});
    
    // Licznik zaktualizowanych i dodanych produktów
    let updated = 0;
    let created = 0;
    
    // Przetwórz każdy produkt
    for (const blProduct of Object.values(baseLinkerProducts.products) || []) {
      try {
        // Sprawdź czy produkt już istnieje (po external_id)
        const existingProduct = await prisma.product.findFirst({
          where: { externalId: String(blProduct.product_id) }
        });
        
        const productData = {
          name: blProduct.name,
          sku: blProduct.sku || undefined,
          ean: blProduct.ean || undefined,
          purchasePrice: undefined, // W nowym typie BaseLinkerProductBasic nie ma purchase_price
          externalId: String(blProduct.product_id)
        };
        
        if (existingProduct) {
          // Aktualizuj istniejący produkt
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          });
          updated++;
        } else {
          // Utwórz nowy produkt
          await prisma.product.create({
            data: productData
          });
          created++;
        }
      } catch (error) {
        logger.error(`Błąd podczas przetwarzania produktu ${blProduct.product_id}:`, error);
        // Kontynuuj z następnym produktem
        continue;
      }
    }
    
    logger.info(`Synchronizacja zakończona. Zaktualizowano: ${updated}, Utworzono: ${created} produktów`);
    
    res.status(200).json({
      message: 'Synchronizacja produktów zakończona pomyślnie',
      stats: {
        updated,
        created,
        total: updated + created
      }
    });
  } catch (error) {
    logger.error('Błąd podczas synchronizacji produktów:', error);
    res.status(500).json({ 
      message: 'Nie udało się zsynchronizować produktów',
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    });
  }
}; 