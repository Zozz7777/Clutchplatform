// UI Manager for Clutch Auto Parts System
class UIManager {
    constructor() {
        this.currentTheme = 'light';
        this.animationsEnabled = true;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupAnimations();
        this.setupResponsiveDesign();
        this.setupAccessibility();
    }

    setupTheme() {
        // Load saved theme or use system preference
        const savedTheme = localStorage.getItem('clutch-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('clutch-theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setupAnimations() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.animationsEnabled = !prefersReducedMotion;
        
        if (!this.animationsEnabled) {
            document.documentElement.classList.add('no-animations');
        }
    }

    setupResponsiveDesign() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Initial resize handling
        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content > div:last-child');

        if (width < 768) {
            // Mobile view
            if (sidebar) sidebar.classList.add('mobile-hidden');
            if (mainContent) mainContent.classList.add('mobile-full');
        } else {
            // Desktop view
            if (sidebar) sidebar.classList.remove('mobile-hidden');
            if (mainContent) mainContent.classList.remove('mobile-full');
        }
    }

    setupAccessibility() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Add focus management
        this.setupFocusManagement();
    }

    handleKeyboardNavigation(e) {
        // Tab navigation enhancement
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }

        // Escape key handling
        if (e.key === 'Escape') {
            this.handleEscapeKey();
        }

        // Arrow key navigation for menus
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleArrowNavigation(e);
        }
    }

    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);

        if (e.shiftKey) {
            // Shift + Tab (backward)
            if (currentIndex <= 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Tab (forward)
            if (currentIndex >= focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    }

    handleEscapeKey() {
        // Close any open modals
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.style.display !== 'none') {
            window.autoPartsApp?.closeModal();
        }

        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }

    handleArrowNavigation(e) {
        const activeElement = document.activeElement;
        const menuItem = activeElement.closest('.menu-item');
        
        if (menuItem) {
            const menuItems = Array.from(document.querySelectorAll('.menu-item'));
            const currentIndex = menuItems.indexOf(menuItem);
            
            let nextIndex;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % menuItems.length;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
            }
            
            if (nextIndex !== undefined) {
                e.preventDefault();
                menuItems[nextIndex].querySelector('.menu-link').focus();
            }
        }
    }

    getFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(document.querySelectorAll(focusableSelectors.join(', ')));
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('focusin', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                this.trapFocusInModal(modal);
            }
        });
    }

    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    // Loading States
    showLoading(element, text = 'جاري التحميل...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${text}</div>
                </div>
            `;
        }
    }

    hideLoading(element, originalContent = '') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.innerHTML = originalContent;
        }
    }

    // Form Validation
    validateForm(form) {
        const errors = [];
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const error = this.validateInput(input);
            if (error) {
                errors.push(error);
            }
        });
        
        return errors;
    }

    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        
        // Required field validation
        if (required && !value) {
            return {
                field: input.name || input.id,
                message: 'هذا الحقل مطلوب'
            };
        }
        
        // Type-specific validation
        switch (type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    return {
                        field: input.name || input.id,
                        message: 'يرجى إدخال بريد إلكتروني صحيح'
                    };
                }
                break;
            case 'tel':
                if (value && !this.isValidPhone(value)) {
                    return {
                        field: input.name || input.id,
                        message: 'يرجى إدخال رقم هاتف صحيح'
                    };
                }
                break;
            case 'number':
                if (value && isNaN(value)) {
                    return {
                        field: input.name || input.id,
                        message: 'يرجى إدخال رقم صحيح'
                    };
                }
                break;
        }
        
        // Custom validation attributes
        const minLength = input.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            return {
                field: input.name || input.id,
                message: `يجب أن يكون النص ${minLength} أحرف على الأقل`
            };
        }
        
        const maxLength = input.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            return {
                field: input.name || input.id,
                message: `يجب أن يكون النص ${maxLength} أحرف على الأكثر`
            };
        }
        
        return null;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    showFormErrors(form, errors) {
        // Clear previous errors
        this.clearFormErrors(form);
        
        errors.forEach(error => {
            const input = form.querySelector(`[name="${error.field}"], #${error.field}`);
            if (input) {
                this.showInputError(input, error.message);
            }
        });
    }

    showInputError(input, message) {
        input.classList.add('error');
        
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFormErrors(form) {
        const errorInputs = form.querySelectorAll('.error');
        const errorMessages = form.querySelectorAll('.error-message');
        
        errorInputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(message => message.remove());
    }

    // Data Tables
    createDataTable(container, data, columns, options = {}) {
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.title;
            if (column.sortable) {
                th.classList.add('sortable');
                th.addEventListener('click', () => this.sortTable(table, column.key));
            }
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                const value = this.getNestedValue(row, column.key);
                td.textContent = column.formatter ? column.formatter(value, row) : value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Clear container and add table
        container.innerHTML = '';
        container.appendChild(table);
        
        return table;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    sortTable(table, columnKey) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.querySelector(`td:nth-child(${this.getColumnIndex(table, columnKey)})`).textContent;
            const bValue = b.querySelector(`td:nth-child(${this.getColumnIndex(table, columnKey)})`).textContent;
            
            return aValue.localeCompare(bValue, 'ar', { numeric: true });
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    getColumnIndex(table, columnKey) {
        const headers = table.querySelectorAll('th');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].dataset.key === columnKey) {
                return i + 1;
            }
        }
        return 1;
    }

    // Search and Filter
    setupSearch(input, target, options = {}) {
        const debounceDelay = options.debounce || 300;
        let timeout;
        
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.performSearch(e.target.value, target, options);
            }, debounceDelay);
        });
    }

    performSearch(query, target, options = {}) {
        const elements = target.querySelectorAll(options.selector || 'tr');
        const searchFields = options.fields || [];
        
        elements.forEach(element => {
            let matches = false;
            
            if (searchFields.length > 0) {
                matches = searchFields.some(field => {
                    const fieldElement = element.querySelector(field);
                    return fieldElement && fieldElement.textContent.toLowerCase().includes(query.toLowerCase());
                });
            } else {
                matches = element.textContent.toLowerCase().includes(query.toLowerCase());
            }
            
            element.style.display = matches ? '' : 'none';
        });
    }

    // Notifications
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    // Utility Methods
    formatNumber(number, locale = 'ar-EG') {
        return new Intl.NumberFormat(locale).format(number);
    }

    formatCurrency(amount, currency = 'EGP', locale = 'ar-EG') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatDate(date, locale = 'ar-EG') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    formatDateTime(date, locale = 'ar-EG') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Animation Helpers
    fadeIn(element, duration = 300) {
        if (!this.animationsEnabled) {
            element.style.opacity = '1';
            return;
        }
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    fadeOut(element, duration = 300) {
        if (!this.animationsEnabled) {
            element.style.display = 'none';
            return;
        }
        
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    slideIn(element, direction = 'right', duration = 300) {
        if (!this.animationsEnabled) {
            element.style.transform = 'translateX(0)';
            return;
        }
        
        const translateX = direction === 'right' ? '100%' : '-100%';
        element.style.transform = `translateX(${translateX})`;
        element.style.transition = `transform ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translateX(0)';
        });
    }

    slideOut(element, direction = 'right', duration = 300) {
        if (!this.animationsEnabled) {
            element.style.display = 'none';
            return;
        }
        
        const translateX = direction === 'right' ? '100%' : '-100%';
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `translateX(${translateX})`;
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
}

// Export singleton instance
const uiManager = new UIManager();
module.exports = uiManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.uiManager = uiManager;
}
