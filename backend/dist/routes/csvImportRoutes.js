"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const csvImportController_1 = require("../controllers/csvImportController");
const router = (0, express_1.Router)();
// Konfiguracja multer dla obsługi plików CSV
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        }
        else {
            cb(new Error('Tylko pliki CSV są dozwolone'));
        }
    }
});
// Endpoint do importu CSV
router.post('/import', upload.single('file'), csvImportController_1.csvImportController.importCSV);
exports.default = router;
