"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allegroRoutes = void 0;
const express_1 = require("express");
const allegroController_1 = require("../controllers/allegroController");
const router = (0, express_1.Router)();
// Import danych z CSV Allegro Billing
router.post('/import-csv', allegroController_1.importCsvData);
// Pobierz opłaty Allegro
router.get('/fees', allegroController_1.getAllegroFees);
exports.allegroRoutes = router;
