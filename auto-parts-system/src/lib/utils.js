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
exports.retry = exports.chunk = exports.sortBy = exports.groupBy = exports.deepClone = exports.throttle = exports.debounce = exports.calculateDiscount = exports.calculateTax = exports.sanitizeInput = exports.validatePhone = exports.validateEmail = exports.generateSKU = exports.generateBarcode = exports.formatDateTime = exports.formatDate = exports.formatCurrency = exports.getAssetsPath = exports.getLogsPath = exports.getDataPath = exports.getAppPath = exports.isDev = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const isDev = () => {
    return process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
};
exports.isDev = isDev;
const getAppPath = () => {
    return (0, exports.isDev)() ? process.cwd() : path.dirname(process.execPath);
};
exports.getAppPath = getAppPath;
const getDataPath = () => {
    return path.join((0, exports.getAppPath)(), 'data');
};
exports.getDataPath = getDataPath;
const getLogsPath = () => {
    return path.join((0, exports.getAppPath)(), 'logs');
};
exports.getLogsPath = getLogsPath;
const getAssetsPath = () => {
    return path.join((0, exports.getAppPath)(), 'assets');
};
exports.getAssetsPath = getAssetsPath;
const formatCurrency = (amount, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date, locale = 'ar-SA') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};
exports.formatDate = formatDate;
const formatDateTime = (date, locale = 'ar-SA') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
exports.formatDateTime = formatDateTime;
const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CLU${timestamp.slice(-8)}${random}`;
};
exports.generateBarcode = generateBarcode;
const generateSKU = (category, brand) => {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const brandCode = brand.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${categoryCode}-${brandCode}-${random}`;
};
exports.generateSKU = generateSKU;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const phoneRegex = /^(\+966|0)?[5-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.validatePhone = validatePhone;
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const calculateTax = (amount, taxRate = 0.15) => {
    return amount * taxRate;
};
exports.calculateTax = calculateTax;
const calculateDiscount = (amount, discountType, discountValue) => {
    if (discountType === 'percentage') {
        return amount * (discountValue / 100);
    }
    return Math.min(discountValue, amount);
};
exports.calculateDiscount = calculateDiscount;
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
exports.throttle = throttle;
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => (0, exports.deepClone)(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = (0, exports.deepClone)(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};
exports.deepClone = deepClone;
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return direction === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return direction === 'asc' ? 1 : -1;
        return 0;
    });
};
exports.sortBy = sortBy;
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
exports.chunk = chunk;
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
    throw lastError;
};
exports.retry = retry;
//# sourceMappingURL=utils.js.map