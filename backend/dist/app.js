"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3002;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Test endpoint
app.get('/', (req, res) => {
    res.json({ message: 'API działa poprawnie' });
});
// Produkty
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Testowy produkt 1', stock: 10 },
        { id: 2, name: 'Testowy produkt 2', stock: 20 },
    ];
    res.json({ success: true, products });
});
// Zamówienia
app.get('/api/orders', (req, res) => {
    const orders = [
        { order_id: '1001', order_status_id: 'new', delivery_fullname: 'Jan Kowalski' },
        { order_id: '1002', order_status_id: 'paid', delivery_fullname: 'Anna Nowak' },
    ];
    res.json({ success: true, orders });
});
// Pozycje zamówień
app.get('/api/order-items', (req, res) => {
    const order_items = [
        { order_id: '1001', product_id: '1', name: 'Testowy produkt 1', quantity: 1 },
        { order_id: '1002', product_id: '2', name: 'Testowy produkt 2', quantity: 2 },
    ];
    res.json({ success: true, order_items });
});
// Pozycje konkretnego zamówienia
app.get('/api/order-items/:orderId', (req, res) => {
    const { orderId } = req.params;
    const orderItems = [
        { order_id: orderId, product_id: '1', name: 'Testowy produkt 1', quantity: 1 },
    ];
    res.json({ success: true, order_items: orderItems });
});
// Synchronizacja produktów
app.post('/api/products/sync', (req, res) => {
    const products = [
        { id: 1, name: 'Testowy produkt 1', stock: 10 },
        { id: 2, name: 'Testowy produkt 2', stock: 20 },
    ];
    res.json({ success: true, message: 'Synchronizacja zakończona', products });
});
// Synchronizacja zamówień
app.post('/api/orders/sync', (req, res) => {
    const orders = [
        { order_id: '1001', order_status_id: 'new', delivery_fullname: 'Jan Kowalski' },
        { order_id: '1002', order_status_id: 'paid', delivery_fullname: 'Anna Nowak' },
    ];
    res.json({ success: true, message: 'Synchronizacja zakończona', orders });
});
// Synchronizacja pozycji zamówień
app.post('/api/order-items/sync', (req, res) => {
    const order_items = [
        { order_id: '1001', product_id: '1', name: 'Testowy produkt 1', quantity: 1 },
        { order_id: '1002', product_id: '2', name: 'Testowy produkt 2', quantity: 2 },
    ];
    res.json({ success: true, message: 'Synchronizacja zakończona', order_items });
});
// Uruchamianie serwera
const server = app.listen(PORT, () => {
    console.log(`Serwer uruchomiony na porcie ${PORT}`);
});
exports.default = app;
