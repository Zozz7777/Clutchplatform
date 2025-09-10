// Import Management System for Excel Import Process
const excelImportManager = require('./excel-import');
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');

class ImportManager {
    constructor() {
        this.currentStep = 1;
        this.selectedFile = null;
        this.fileData = null;
        this.validationResults = null;
        this.importResults = null;
        this.isImporting = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File selection
        const selectFileBtn = document.getElementById('select-file-btn');
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
                this.selectFile();
            });
        }

        // Download template
        const downloadTemplateBtn = document.getElementById('download-template-btn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                this.downloadTemplate();
            });
        }

        // Drag and drop
        const fileUploadArea = document.getElementById('file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });

            fileUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
            });

            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelection(files[0]);
                }
            });
        }

        // Modal navigation
        const importModalNext = document.getElementById('import-modal-next');
        if (importModalNext) {
            importModalNext.addEventListener('click', () => {
                this.nextStep();
            });
        }

        const importModalImport = document.getElementById('import-modal-import');
        if (importModalImport) {
            importModalImport.addEventListener('click', () => {
                this.startImport();
            });
        }

        const importModalCancel = document.getElementById('import-modal-cancel');
        if (importModalCancel) {
            importModalCancel.addEventListener('click', () => {
                this.closeImportModal();
            });
        }

        const importModalClose = document.getElementById('import-modal-close');
        if (importModalClose) {
            importModalClose.addEventListener('click', () => {
                this.closeImportModal();
            });
        }
    }

    async selectFile() {
        try {
            const filePath = await excelImportManager.openFileDialog();
            if (filePath) {
                await this.handleFileSelection({ path: filePath });
            }
        } catch (error) {
            console.error('Error selecting file:', error);
            uiManager.showNotification('خطأ في اختيار الملف', 'error');
        }
    }

    async handleFileSelection(file) {
        try {
            this.selectedFile = file;
            
            // Show loading state
            const fileUploadArea = document.getElementById('file-upload-area');
            if (fileUploadArea) {
                fileUploadArea.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">جاري قراءة الملف...</div>
                    </div>
                `;
            }

            // Read file
            const filePath = file.path || file;
            this.fileData = await excelImportManager.readExcelFile(filePath);

            // Update UI
            this.updateFileSelectionUI();
            
            // Enable next button
            const nextBtn = document.getElementById('import-modal-next');
            if (nextBtn) {
                nextBtn.disabled = false;
            }

            uiManager.showNotification('تم قراءة الملف بنجاح', 'success');

        } catch (error) {
            console.error('Error handling file selection:', error);
            uiManager.showNotification(`خطأ في قراءة الملف: ${error.message}`, 'error');
            this.resetFileSelection();
        }
    }

    updateFileSelectionUI() {
        const fileUploadArea = document.getElementById('file-upload-area');
        if (!fileUploadArea || !this.fileData) return;

        fileUploadArea.innerHTML = `
            <div class="file-selected">
                <div class="file-icon">📄</div>
                <div class="file-info">
                    <div class="file-name">${this.getFileName()}</div>
                    <div class="file-details">
                        ${this.fileData.totalRows} صف من البيانات
                    </div>
                </div>
                <button class="btn btn-small btn-secondary" onclick="importManager.selectFile()">
                    تغيير الملف
                </button>
            </div>
        `;
    }

    getFileName() {
        if (!this.selectedFile) return 'ملف غير محدد';
        return this.selectedFile.name || this.selectedFile.path?.split('/').pop() || 'ملف Excel';
    }

    resetFileSelection() {
        this.selectedFile = null;
        this.fileData = null;
        
        const fileUploadArea = document.getElementById('file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.innerHTML = `
                <div class="upload-icon">📁</div>
                <h4>اسحب الملف هنا أو اضغط للاختيار</h4>
                <p>يدعم الملفات: Excel (.xlsx, .xls) و CSV</p>
                <button class="btn btn-primary" id="select-file-btn">اختيار ملف</button>
            `;
        }

        const nextBtn = document.getElementById('import-modal-next');
        if (nextBtn) {
            nextBtn.disabled = true;
        }
    }

    async downloadTemplate() {
        try {
            const templatePath = await excelImportManager.generateTemplate();
            if (templatePath) {
                uiManager.showNotification('تم تحميل القالب بنجاح', 'success');
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            uiManager.showNotification('خطأ في تحميل القالب', 'error');
        }
    }

    async nextStep() {
        if (this.currentStep === 1) {
            await this.validateData();
            if (this.validationResults && this.validationResults.isValid) {
                this.currentStep = 2;
                this.updateStepUI();
                this.showValidationResults();
            } else {
                uiManager.showNotification('يوجد أخطاء في البيانات. يرجى مراجعتها أولاً.', 'warning');
            }
        } else if (this.currentStep === 2) {
            this.currentStep = 3;
            this.updateStepUI();
            this.showImportOptions();
        }
    }

    async validateData() {
        if (!this.fileData) {
            uiManager.showNotification('لم يتم اختيار ملف', 'error');
            return;
        }

        try {
            // Show loading state
            const validationResults = document.getElementById('validation-results');
            if (validationResults) {
                validationResults.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">جاري التحقق من البيانات...</div>
                    </div>
                `;
            }

            // Validate data
            this.validationResults = await excelImportManager.validateAllData(
                this.fileData.headers,
                this.fileData.data
            );

            // Show results
            this.showValidationResults();

        } catch (error) {
            console.error('Error validating data:', error);
            uiManager.showNotification('خطأ في التحقق من البيانات', 'error');
        }
    }

    showValidationResults() {
        const validationResults = document.getElementById('validation-results');
        if (!validationResults || !this.validationResults) return;

        const { isValid, headerErrors, dataErrors, validItems, totalRows } = this.validationResults;

        let html = `
            <div class="validation-summary">
                <h4>نتائج التحقق من البيانات</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">إجمالي الصفوف:</span>
                        <span class="stat-value">${totalRows}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">صالح للاستيراد:</span>
                        <span class="stat-value success">${validItems.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">يحتوي أخطاء:</span>
                        <span class="stat-value error">${dataErrors.length}</span>
                    </div>
                </div>
            </div>
        `;

        // Show header errors
        if (headerErrors.length > 0) {
            html += `
                <div class="error-section">
                    <h5>أخطاء في رؤوس الأعمدة:</h5>
                    <ul class="error-list">
                        ${headerErrors.map(error => `<li class="error-item">${error.message}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Show data errors
        if (dataErrors.length > 0) {
            html += `
                <div class="error-section">
                    <h5>أخطاء في البيانات:</h5>
                    <div class="data-errors">
                        ${dataErrors.slice(0, 10).map(error => `
                            <div class="data-error">
                                <span class="error-row">الصف ${error.row}:</span>
                                <span class="error-message">${error.message}</span>
                            </div>
                        `).join('')}
                        ${dataErrors.length > 10 ? `<div class="more-errors">و ${dataErrors.length - 10} خطأ آخر...</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Show valid items preview
        if (validItems.length > 0) {
            html += `
                <div class="valid-items-section">
                    <h5>معاينة البيانات الصالحة:</h5>
                    <div class="items-preview">
                        ${validItems.slice(0, 5).map(item => `
                            <div class="item-preview">
                                <span class="item-name">${item.name}</span>
                                <span class="item-details">${item.category} - ${item.brand} - ${item.unit_price}</span>
                            </div>
                        `).join('')}
                        ${validItems.length > 5 ? `<div class="more-items">و ${validItems.length - 5} عنصر آخر...</div>` : ''}
                    </div>
                </div>
            `;
        }

        validationResults.innerHTML = html;

        // Update next button
        const nextBtn = document.getElementById('import-modal-next');
        if (nextBtn) {
            nextBtn.disabled = !isValid || validItems.length === 0;
            nextBtn.textContent = isValid ? 'التالي' : 'لا يمكن المتابعة';
        }
    }

    showImportOptions() {
        const step3Content = document.getElementById('step-3');
        if (!step3Content) return;

        step3Content.innerHTML = `
            <div class="import-options">
                <h4>خيارات الاستيراد</h4>
                <div class="options-grid">
                    <div class="option-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="skip-duplicates" checked>
                            <span class="checkmark"></span>
                            تخطي العناصر المكررة
                        </label>
                    </div>
                    <div class="option-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="update-existing" checked>
                            <span class="checkmark"></span>
                            تحديث العناصر الموجودة
                        </label>
                    </div>
                    <div class="option-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="create-categories" checked>
                            <span class="checkmark"></span>
                            إنشاء فئات جديدة
                        </label>
                    </div>
                    <div class="option-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="create-brands" checked>
                            <span class="checkmark"></span>
                            إنشاء ماركات جديدة
                        </label>
                    </div>
                    <div class="option-item">
                        <label class="checkbox-label">
                            <input type="checkbox" id="create-suppliers" checked>
                            <span class="checkmark"></span>
                            إنشاء موردين جدد
                        </label>
                    </div>
                </div>
                
                <div class="import-summary">
                    <h5>ملخص الاستيراد:</h5>
                    <div class="summary-item">
                        <span>عدد العناصر للاستيراد:</span>
                        <span class="highlight">${this.validationResults.validItems.length}</span>
                    </div>
                </div>
            </div>
        `;

        // Show import button
        const importBtn = document.getElementById('import-modal-import');
        if (importBtn) {
            importBtn.style.display = 'inline-block';
        }
    }

    async startImport() {
        if (this.isImporting) return;

        this.isImporting = true;

        try {
            // Get import options
            const options = {
                skipDuplicates: document.getElementById('skip-duplicates')?.checked || false,
                updateExisting: document.getElementById('update-existing')?.checked || false,
                createCategories: document.getElementById('create-categories')?.checked || false,
                createBrands: document.getElementById('create-brands')?.checked || false,
                createSuppliers: document.getElementById('create-suppliers')?.checked || false
            };

            // Show progress
            this.showImportProgress();

            // Start import
            this.importResults = await excelImportManager.importData(
                this.validationResults.validItems,
                options
            );

            // Show results
            this.showImportResults();

            // Sync with backend
            await this.syncImportedData();

        } catch (error) {
            console.error('Error during import:', error);
            uiManager.showNotification('خطأ في الاستيراد', 'error');
        } finally {
            this.isImporting = false;
        }
    }

    showImportProgress() {
        const step3Content = document.getElementById('step-3');
        if (!step3Content) return;

        step3Content.innerHTML = `
            <div class="import-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="import-progress-fill"></div>
                </div>
                <div class="progress-text" id="import-progress-text">جاري الاستيراد...</div>
                <div class="progress-details" id="import-progress-details">
                    <div class="progress-item">التحقق من البيانات...</div>
                </div>
            </div>
        `;

        // Simulate progress
        this.simulateProgress();
    }

    simulateProgress() {
        const progressFill = document.getElementById('import-progress-fill');
        const progressText = document.getElementById('import-progress-text');
        const progressDetails = document.getElementById('import-progress-details');

        let progress = 0;
        const steps = [
            'التحقق من البيانات...',
            'إنشاء الفئات والماركات...',
            'استيراد العناصر...',
            'تحديث المخزون...',
            'المزامنة مع الخادم...',
            'الانتهاء...'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }

            const stepIndex = Math.floor((progress / 100) * steps.length);
            if (stepIndex < steps.length && progressDetails) {
                progressDetails.innerHTML = `<div class="progress-item">${steps[stepIndex]}</div>`;
            }

            if (progress >= 100) {
                clearInterval(interval);
                if (progressText) {
                    progressText.textContent = 'تم الاستيراد بنجاح!';
                }
            }
        }, 200);
    }

    showImportResults() {
        const step3Content = document.getElementById('step-3');
        if (!step3Content || !this.importResults) return;

        const { imported, updated, skipped, errors } = this.importResults;

        step3Content.innerHTML = `
            <div class="import-results">
                <div class="results-header">
                    <h4>نتائج الاستيراد</h4>
                    <div class="results-icon success">✅</div>
                </div>
                
                <div class="results-summary">
                    <div class="result-item success">
                        <span class="result-label">تم استيراد:</span>
                        <span class="result-value">${imported} عنصر جديد</span>
                    </div>
                    <div class="result-item info">
                        <span class="result-label">تم تحديث:</span>
                        <span class="result-value">${updated} عنصر موجود</span>
                    </div>
                    <div class="result-item warning">
                        <span class="result-label">تم تخطي:</span>
                        <span class="result-value">${skipped} عنصر مكرر</span>
                    </div>
                    ${errors.length > 0 ? `
                        <div class="result-item error">
                            <span class="result-label">أخطاء:</span>
                            <span class="result-value">${errors.length} خطأ</span>
                        </div>
                    ` : ''}
                </div>

                ${errors.length > 0 ? `
                    <div class="errors-section">
                        <h5>الأخطاء:</h5>
                        <div class="errors-list">
                            ${errors.slice(0, 5).map(error => `
                                <div class="error-item">
                                    <span class="error-name">${error.item.name}</span>
                                    <span class="error-message">${error.error}</span>
                                </div>
                            `).join('')}
                            ${errors.length > 5 ? `<div class="more-errors">و ${errors.length - 5} خطأ آخر...</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="importManager.closeImportModal()">
                        إغلاق
                    </button>
                    <button class="btn btn-secondary" onclick="importManager.downloadTemplate()">
                        تحميل قالب جديد
                    </button>
                </div>
            </div>
        `;
    }

    async syncImportedData() {
        try {
            // Sync imported items with Clutch backend
            if (this.importResults && this.importResults.imported > 0) {
                await apiManager.batchSyncInventory(this.validationResults.validItems);
                console.log('Imported data synced with backend');
            }
        } catch (error) {
            console.error('Error syncing imported data:', error);
            // Don't show error to user as import was successful locally
        }
    }

    updateStepUI() {
        // Update step indicators
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Show/hide step content
        const stepContents = document.querySelectorAll('.step-content');
        stepContents.forEach((content, index) => {
            const stepNumber = index + 1;
            if (stepNumber === this.currentStep) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });

        // Update buttons
        const nextBtn = document.getElementById('import-modal-next');
        const importBtn = document.getElementById('import-modal-import');

        if (nextBtn) {
            if (this.currentStep < 3) {
                nextBtn.style.display = 'inline-block';
                nextBtn.textContent = 'التالي';
            } else {
                nextBtn.style.display = 'none';
            }
        }

        if (importBtn) {
            importBtn.style.display = this.currentStep === 3 ? 'inline-block' : 'none';
        }
    }

    openImportModal() {
        const modal = document.getElementById('import-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetImportProcess();
        }
    }

    closeImportModal() {
        const modal = document.getElementById('import-modal');
        if (modal) {
            modal.style.display = 'none';
            this.resetImportProcess();
        }
    }

    resetImportProcess() {
        this.currentStep = 1;
        this.selectedFile = null;
        this.fileData = null;
        this.validationResults = null;
        this.importResults = null;
        this.isImporting = false;

        // Reset UI
        this.updateStepUI();
        this.resetFileSelection();

        // Reset buttons
        const nextBtn = document.getElementById('import-modal-next');
        const importBtn = document.getElementById('import-modal-import');

        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.display = 'inline-block';
        }

        if (importBtn) {
            importBtn.style.display = 'none';
        }
    }
}

// Export singleton instance
const importManager = new ImportManager();
module.exports = importManager;
