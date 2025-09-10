// Settings Manager for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const uiManager = require('./ui');

class SettingsManager {
    constructor() {
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.renderSettings();
    }

    async loadSettings() {
        try {
            const settings = await databaseManager.allQuery('SELECT * FROM settings');
            this.settings = {};
            
            settings.forEach(setting => {
                this.settings[setting.key] = setting.value;
            });

            this.setDefaultSettings();
            
        } catch (error) {
            console.error('Error loading settings:', error);
            this.setDefaultSettings();
        }
    }

    setDefaultSettings() {
        const defaults = {
            'shop_name': 'متجر قطع الغيار',
            'currency': 'EGP',
            'language': 'ar',
            'theme': 'light',
            'tax_rate': '14',
            'low_stock_threshold': '10'
        };

        Object.keys(defaults).forEach(key => {
            if (!this.settings.hasOwnProperty(key)) {
                this.settings[key] = defaults[key];
            }
        });
    }

    setupEventListeners() {
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }

    renderSettings() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-container">
                <div class="settings-section">
                    <h3>معلومات المتجر</h3>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <label for="shop_name">اسم المتجر</label>
                            <input type="text" id="shop_name" value="${this.settings.shop_name || ''}" />
                        </div>
                        <div class="setting-item">
                            <label for="currency">العملة</label>
                            <select id="currency">
                                <option value="EGP" ${this.settings.currency === 'EGP' ? 'selected' : ''}>جنيه مصري</option>
                                <option value="USD" ${this.settings.currency === 'USD' ? 'selected' : ''}>دولار أمريكي</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label for="tax_rate">معدل الضريبة (%)</label>
                            <input type="number" id="tax_rate" value="${this.settings.tax_rate || '14'}" min="0" max="100" />
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button id="save-settings-btn" class="btn btn-primary">حفظ الإعدادات</button>
                </div>
            </div>
        `;
    }

    async saveSettings() {
        try {
            const settingsToSave = {};

            const inputs = document.querySelectorAll('#settings-content input, #settings-content select');
            
            inputs.forEach(input => {
                settingsToSave[input.id] = input.value;
            });

            for (const [key, value] of Object.entries(settingsToSave)) {
                await databaseManager.runQuery(
                    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
                    [key, value, new Date().toISOString()]
                );
            }

            this.settings = { ...this.settings, ...settingsToSave };
            uiManager.showNotification('تم حفظ الإعدادات بنجاح', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            uiManager.showNotification('خطأ في حفظ الإعدادات', 'error');
        }
    }

    getSetting(key, defaultValue = null) {
        return this.settings[key] || defaultValue;
    }
}

const settingsManager = new SettingsManager();
module.exports = settingsManager;