import { Request, Response } from 'express';
import prisma from '../config/db';
import { logger } from '../utils/logger';

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