"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
// Create logs directory if it doesn't exist
const logsPath = (0, utils_1.getLogsPath)();
// Define log format
const logFormat = winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston.format.errors({ stack: true }), winston.format.json());
// Create logger instance
exports.logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'clutch-auto-parts' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logsPath, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Write error logs to error.log
        new winston.transports.File({
            filename: path.join(logsPath, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
// Create a stream object for Morgan HTTP logging
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
// Log uncaught exceptions
process.on('uncaughtException', (error) => {
    exports.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    exports.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map