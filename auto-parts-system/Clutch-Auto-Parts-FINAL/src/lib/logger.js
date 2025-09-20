import * as winston from 'winston';
import * as path from 'path';
import { getLogsPath } from './utils';
// Create logs directory if it doesn't exist
const logsPath = getLogsPath();
// Define log format
const logFormat = winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston.format.errors({ stack: true }), winston.format.json());
// Create logger instance
export const logger = winston.createLogger({
    level: process.env['NODE_ENV'] === 'development' ? 'debug' : 'info',
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
export const morganStream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
// Log uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
export default logger;
//# sourceMappingURL=logger.js.map