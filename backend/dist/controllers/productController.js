"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const db_1 = require("../config/db");
const logger_1 = require("../utils/logger");
const baseLinkerService_1 = require("../services/baseLinkerService");
// Pobierz wszystkie produkty
const getProducts = async (req, res) => {
    try {
        const products = await db_1.prisma.product.findMany();
        res.status(200).json(products);
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas pobierania produktów:', error);
        res.status(500).json({ message: 'Nie udało się pobrać produktów' });
    }
};
exports.getProducts = getProducts;
// Pobierz produkt po ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db_1.prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) {
            res.status(404).json({ message: 'Produkt nie został znaleziony' });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas pobierania produktu o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się pobrać produktu' });
    }
};
exports.getProductById = getProductById;
// Utwórz nowy produkt
const createProduct = async (req, res) => {
    try {
        const { name, sku, ean, purchasePrice, allegro_category_id, allegro_seller_id } = req.body;
        const product = await db_1.prisma.product.create({
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
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas tworzenia produktu:', error);
        res.status(500).json({ message: 'Nie udało się utworzyć produktu' });
    }
};
exports.createProduct = createProduct;
// Zaktualizuj produkt
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sku, ean, purchasePrice, allegro_category_id, allegro_seller_id } = req.body;
        const product = await db_1.prisma.product.update({
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
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas aktualizacji produktu o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się zaktualizować produktu' });
    }
};
exports.updateProduct = updateProduct;
// Usuń produkt
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.product.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error(`Błąd podczas usuwania produktu o ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Nie udało się usunąć produktu' });
    }
};
exports.deleteProduct = deleteProduct;
// Synchronizuj produkty z BaseLinker
const syncProducts = async (req, res) => {
    try {
        logger_1.logger.info('Rozpoczęcie synchronizacji produktów z BaseLinker');
        const inventoryId = process.env.BASELINKER_INVENTORY_ID || '';
        if (!inventoryId) {
            throw new Error('Nie skonfigurowano BASELINKER_INVENTORY_ID');
        }
        // Pobierz produkty z BaseLinker
        const baseLinkerProducts = await baseLinkerService_1.baseLinkerService.getProducts({
            inventory_id: inventoryId
        });
        // Licznik zaktualizowanych i dodanych produktów
        let updated = 0;
        let created = 0;
        // Przetwórz każdy produkt
        const products = Object.values(baseLinkerProducts.data.products || {});
        // Pobierz szczegóły produktów
        const productIds = products.map(p => Number(p.id));
        const productDetails = await baseLinkerService_1.baseLinkerService.getProductDetails({
            inventory_id: inventoryId,
            products: productIds
        });
        for (const blProduct of products) {
            try {
                const productDetail = productDetails.data.products[blProduct.id];
                // Sprawdź czy produkt już istnieje (po external_id)
                const existingProduct = await db_1.prisma.product.findFirst({
                    where: { externalId: String(blProduct.id) }
                });
                const productData = {
                    name: blProduct.name,
                    sku: blProduct.sku || undefined,
                    ean: blProduct.ean || undefined,
                    purchasePrice: productDetail?.average_cost ? Number(productDetail.average_cost) : undefined,
                    externalId: String(blProduct.id)
                };
                if (existingProduct) {
                    // Aktualizuj istniejący produkt
                    await db_1.prisma.product.update({
                        where: { id: existingProduct.id },
                        data: productData
                    });
                    updated++;
                }
                else {
                    // Utwórz nowy produkt
                    await db_1.prisma.product.create({
                        data: productData
                    });
                    created++;
                }
            }
            catch (error) {
                logger_1.logger.error(`Błąd podczas przetwarzania produktu ${blProduct.id}:`, error);
                // Kontynuuj z następnym produktem
                continue;
            }
        }
        logger_1.logger.info(`Synchronizacja zakończona. Zaktualizowano: ${updated}, Utworzono: ${created} produktów`);
        res.status(200).json({
            message: 'Synchronizacja produktów zakończona pomyślnie',
            stats: {
                updated,
                created,
                total: updated + created
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Błąd podczas synchronizacji produktów:', error);
        res.status(500).json({
            message: 'Nie udało się zsynchronizować produktów',
            error: error instanceof Error ? error.message : 'Nieznany błąd'
        });
    }
};
exports.syncProducts = syncProducts;
