import { app } from 'electron';
import * as path from 'path';
export const isDev = () => {
    return process.env['NODE_ENV'] === 'development' || !app.isPackaged;
};
export const getAppPath = () => {
    return isDev() ? process.cwd() : path.dirname(process.execPath);
};
export const getDataPath = () => {
    return path.join(getAppPath(), 'data');
};
export const getLogsPath = () => {
    return path.join(getAppPath(), 'logs');
};
export const getAssetsPath = () => {
    return path.join(getAppPath(), 'assets');
};
export const formatCurrency = (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
};
export const formatDate = (date, locale = 'ar-SA') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};
export const formatDateTime = (date, locale = 'ar-SA') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
export const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CLU${timestamp.slice(-8)}${random}`;
};
export const generateSKU = (category, brand) => {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const brandCode = brand.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${categoryCode}-${brandCode}-${random}`;
};
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validatePhone = (phone) => {
    const phoneRegex = /^(\+966|0)?[5-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
export const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
export const calculateTax = (amount, taxRate = 0.15) => {
    return amount * taxRate;
};
export const calculateDiscount = (amount, discountType, discountValue) => {
    if (discountType === 'percentage') {
        return amount * (discountValue / 100);
    }
    return Math.min(discountValue, amount);
};
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
export const sortBy = (array, key, direction = 'asc') => {
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
export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
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
//# sourceMappingURL=utils.js.map