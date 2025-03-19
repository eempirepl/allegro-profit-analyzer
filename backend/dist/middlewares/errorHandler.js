"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Wystąpił błąd serwera';
    logger_1.logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
