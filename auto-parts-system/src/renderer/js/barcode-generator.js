// Barcode Generator for Clutch Auto Parts System
const { ipcRenderer } = require('electron');

class BarcodeGenerator {
    constructor() {
        this.barcodeTypes = {
            CODE128: 'CODE128',
            CODE39: 'CODE39',
            EAN13: 'EAN13',
            EAN8: 'EAN8',
            UPC: 'UPC'
        };
        this.defaultType = this.barcodeTypes.CODE128;
        this.defaultOptions = {
            format: 'PNG',
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 20,
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: 2,
            background: '#ffffff',
            lineColor: '#000000'
        };
    }

    generateBarcode(text, options = {}) {
        try {
            const mergedOptions = { ...this.defaultOptions, ...options };
            
            // Create canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 300;
            canvas.height = 150;
            
            // Clear canvas
            ctx.fillStyle = mergedOptions.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Generate barcode pattern
            const barcodeData = this.generateBarcodePattern(text, mergedOptions);
            
            // Draw barcode
            this.drawBarcode(ctx, barcodeData, mergedOptions);
            
            // Draw text if enabled
            if (mergedOptions.displayValue) {
                this.drawBarcodeText(ctx, text, mergedOptions);
            }
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error generating barcode:', error);
            throw new Error('خطأ في توليد الباركود');
        }
    }

    generateBarcodePattern(text, options) {
        // Simple barcode pattern generation
        // In a real implementation, you would use a proper barcode library
        const pattern = [];
        const barWidth = options.width;
        const barHeight = options.height;
        
        // Generate alternating bars for demonstration
        for (let i = 0; i < text.length * 4; i++) {
            pattern.push({
                width: barWidth,
                height: barHeight,
                color: i % 2 === 0 ? options.lineColor : options.background
            });
        }
        
        return pattern;
    }

    drawBarcode(ctx, pattern, options) {
        let x = 20; // Start position
        
        pattern.forEach(bar => {
            ctx.fillStyle = bar.color;
            ctx.fillRect(x, 20, bar.width, bar.height);
            x += bar.width;
        });
    }

    drawBarcodeText(ctx, text, options) {
        ctx.fillStyle = options.lineColor;
        ctx.font = `${options.fontSize}px Arial`;
        ctx.textAlign = options.textAlign;
        
        const textY = 20 + options.height + options.textMargin + options.fontSize;
        const textX = ctx.canvas.width / 2;
        
        ctx.fillText(text, textX, textY);
    }

    generateRandomBarcode(length = 13) {
        let barcode = '';
        for (let i = 0; i < length; i++) {
            barcode += Math.floor(Math.random() * 10);
        }
        return barcode;
    }

    validateBarcode(barcode, type = this.defaultType) {
        if (!barcode || barcode.trim() === '') {
            return { isValid: false, message: 'الباركود فارغ' };
        }

        // Remove any non-numeric characters for numeric barcodes
        const cleanBarcode = barcode.replace(/\D/g, '');
        
        switch (type) {
            case this.barcodeTypes.EAN13:
                if (cleanBarcode.length !== 13) {
                    return { isValid: false, message: 'باركود EAN13 يجب أن يكون 13 رقم' };
                }
                break;
            case this.barcodeTypes.EAN8:
                if (cleanBarcode.length !== 8) {
                    return { isValid: false, message: 'باركود EAN8 يجب أن يكون 8 أرقام' };
                }
                break;
            case this.barcodeTypes.UPC:
                if (cleanBarcode.length !== 12) {
                    return { isValid: false, message: 'باركود UPC يجب أن يكون 12 رقم' };
                }
                break;
            case this.barcodeTypes.CODE128:
            case this.barcodeTypes.CODE39:
                // These can contain alphanumeric characters
                if (barcode.length < 1) {
                    return { isValid: false, message: 'الباركود قصير جداً' };
                }
                break;
        }

        return { isValid: true, message: 'باركود صحيح' };
    }

    async saveBarcode(barcodeData, filename) {
        try {
            const result = await ipcRenderer.invoke('show-save-dialog', {
                title: 'حفظ الباركود',
                defaultPath: filename || 'barcode.png',
                filters: [
                    { name: 'PNG Files', extensions: ['png'] },
                    { name: 'JPEG Files', extensions: ['jpg', 'jpeg'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!result.canceled && result.filePath) {
                // Convert data URL to blob
                const response = await fetch(barcodeData);
                const blob = await response.blob();
                
                // Save file (this would need to be implemented in main process)
                await ipcRenderer.invoke('save-file', {
                    filePath: result.filePath,
                    data: barcodeData
                });
                
                return result.filePath;
            }
            return null;
        } catch (error) {
            console.error('Error saving barcode:', error);
            throw error;
        }
    }

    async printBarcode(barcodeData) {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>طباعة الباركود</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                text-align: center;
                                font-family: Arial, sans-serif;
                            }
                            img {
                                max-width: 100%;
                                height: auto;
                            }
                            @media print {
                                body { margin: 0; }
                                @page { margin: 0.5in; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${barcodeData}" alt="Barcode">
                        <script>
                            window.onload = function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error('Error printing barcode:', error);
            throw error;
        }
    }

    generateBarcodeForItem(itemName, itemId) {
        // Generate a unique barcode based on item name and ID
        const timestamp = Date.now().toString().slice(-6);
        const itemCode = itemId.toString().padStart(4, '0');
        const nameCode = this.getTextCode(itemName);
        
        return `${itemCode}${nameCode}${timestamp}`;
    }

    getTextCode(text) {
        // Convert text to numeric code
        let code = '';
        for (let i = 0; i < Math.min(text.length, 3); i++) {
            const char = text.charCodeAt(i);
            code += (char % 10).toString();
        }
        return code.padStart(3, '0');
    }

    // Barcode scanning simulation (for testing)
    simulateBarcodeScan() {
        const barcodes = [
            '1234567890123',
            '9876543210987',
            '5555555555555',
            '1111111111111',
            '9999999999999'
        ];
        
        const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
        return randomBarcode;
    }

    // Batch barcode generation
    generateBatchBarcodes(items, options = {}) {
        const barcodes = [];
        
        items.forEach((item, index) => {
            try {
                const barcodeText = item.barcode || this.generateBarcodeForItem(item.name, item.id || index);
                const barcodeData = this.generateBarcode(barcodeText, options);
                
                barcodes.push({
                    item: item,
                    barcode: barcodeText,
                    data: barcodeData,
                    filename: `barcode_${item.name.replace(/\s+/g, '_')}_${index}.png`
                });
            } catch (error) {
                console.error(`Error generating barcode for item ${item.name}:`, error);
                barcodes.push({
                    item: item,
                    barcode: null,
                    data: null,
                    error: error.message
                });
            }
        });
        
        return barcodes;
    }

    // Barcode format detection
    detectBarcodeFormat(barcode) {
        const cleanBarcode = barcode.replace(/\D/g, '');
        
        if (cleanBarcode.length === 13) {
            return this.barcodeTypes.EAN13;
        } else if (cleanBarcode.length === 8) {
            return this.barcodeTypes.EAN8;
        } else if (cleanBarcode.length === 12) {
            return this.barcodeTypes.UPC;
        } else if (/^[A-Z0-9\-\s]+$/.test(barcode)) {
            return this.barcodeTypes.CODE39;
        } else {
            return this.barcodeTypes.CODE128;
        }
    }

    // Get barcode options for different types
    getBarcodeOptions(type) {
        const baseOptions = { ...this.defaultOptions };
        
        switch (type) {
            case this.barcodeTypes.EAN13:
                return {
                    ...baseOptions,
                    width: 1,
                    height: 80,
                    fontSize: 16
                };
            case this.barcodeTypes.EAN8:
                return {
                    ...baseOptions,
                    width: 1,
                    height: 60,
                    fontSize: 14
                };
            case this.barcodeTypes.UPC:
                return {
                    ...baseOptions,
                    width: 1,
                    height: 80,
                    fontSize: 16
                };
            case this.barcodeTypes.CODE39:
                return {
                    ...baseOptions,
                    width: 2,
                    height: 100,
                    fontSize: 18
                };
            case this.barcodeTypes.CODE128:
            default:
                return baseOptions;
        }
    }
}

// Export singleton instance
const barcodeGenerator = new BarcodeGenerator();
module.exports = barcodeGenerator;
