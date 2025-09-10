const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

// ==================== TRANSLATIONS ====================

// Get translations for specific language
router.get('/translations/:language', async (req, res) => {
    try {
        const { language } = req.params;
        const { platform, version } = req.query;

        if (!language) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_LANGUAGE',
                message: 'Language parameter is required'
            });
        }

        const translationsCollection = await getCollection('translations');
        
        const filters = { language: language.toLowerCase() };
        if (platform) filters.platform = platform;
        if (version) filters.version = version;

        const translations = await translationsCollection.findOne(filters);

        if (!translations) {
            // Return default English translations if requested language not found
            const defaultTranslations = await translationsCollection.findOne({ 
                language: 'en',
                platform: platform || 'mobile'
            });

            return res.json({
                success: true,
                data: {
                    language: 'en',
                    fallback: true,
                    translations: defaultTranslations?.translations || {},
                    lastUpdated: defaultTranslations?.updatedAt || new Date()
                }
            });
        }

        res.json({
            success: true,
            data: {
                language: translations.language,
                translations: translations.translations,
                lastUpdated: translations.updatedAt,
                version: translations.version
            }
        });
    } catch (error) {
        logger.error('Get translations error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_TRANSLATIONS_ERROR',
            message: 'Failed to retrieve translations'
        });
    }
});

// Get supported languages
router.get('/supported-languages', async (req, res) => {
    try {
        const { platform } = req.query;

        const translationsCollection = await getCollection('translations');
        
        const filters = { isActive: true };
        if (platform) filters.platform = platform;

        const languages = await translationsCollection.find(filters)
            .project({ 
                language: 1, 
                name: 1, 
                nativeName: 1, 
                isRTL: 1, 
                completion: 1,
                updatedAt: 1 
            })
            .sort({ completion: -1 })
            .toArray();

        const supportedLanguages = languages.map(lang => ({
            code: lang.language,
            name: lang.name,
            nativeName: lang.nativeName,
            isRTL: lang.isRTL || false,
            completion: lang.completion || 0,
            lastUpdated: lang.updatedAt
        }));

        res.json({
            success: true,
            data: supportedLanguages
        });
    } catch (error) {
        logger.error('Get supported languages error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SUPPORTED_LANGUAGES_ERROR',
            message: 'Failed to retrieve supported languages'
        });
    }
});

// Submit translation feedback
router.post('/feedback', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            language, 
            key, 
            originalText, 
            suggestedText, 
            context, 
            platform 
        } = req.body;

        if (!language || !key || !originalText || !suggestedText) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Language, key, original text, and suggested text are required'
            });
        }

        const feedbackCollection = await getCollection('translation_feedback');
        
        const feedback = {
            userId,
            language: language.toLowerCase(),
            key,
            originalText,
            suggestedText,
            context: context || '',
            platform: platform || 'mobile',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await feedbackCollection.insertOne(feedback);

        res.status(201).json({
            success: true,
            message: 'Translation feedback submitted successfully',
            data: {
                feedbackId: feedback._id,
                status: feedback.status
            }
        });
    } catch (error) {
        logger.error('Submit translation feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'SUBMIT_FEEDBACK_ERROR',
            message: 'Failed to submit translation feedback'
        });
    }
});

// Get translation feedback
router.get('/feedback', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { language, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filters = { userId };
        if (language) filters.language = language.toLowerCase();
        if (status) filters.status = status;

        const feedbackCollection = await getCollection('translation_feedback');
        const [feedback, total] = await Promise.all([
            feedbackCollection.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            feedbackCollection.countDocuments(filters)
        ]);

        res.json({
            success: true,
            data: feedback,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get translation feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_FEEDBACK_ERROR',
            message: 'Failed to retrieve translation feedback'
        });
    }
});

// ==================== CURRENCY & REGIONAL SETTINGS ====================

// Get currency exchange rates
router.get('/currency-rates', async (req, res) => {
    try {
        const { base = 'USD' } = req.query;

        const ratesCollection = await getCollection('currency_rates');
        const rates = await ratesCollection.findOne({ 
            base: base.toUpperCase(),
            isActive: true 
        });

        if (!rates) {
            // Return default rates if not found
            const defaultRates = {
                base: 'USD',
                rates: {
                    EUR: 0.85,
                    GBP: 0.73,
                    JPY: 110.50,
                    CAD: 1.25,
                    AUD: 1.35,
                    CHF: 0.92,
                    CNY: 6.45,
                    INR: 74.50,
                    BRL: 5.25,
                    MXN: 20.15
                },
                lastUpdated: new Date()
            };

            return res.json({
                success: true,
                data: defaultRates
            });
        }

        res.json({
            success: true,
            data: {
                base: rates.base,
                rates: rates.rates,
                lastUpdated: rates.updatedAt
            }
        });
    } catch (error) {
        logger.error('Get currency rates error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CURRENCY_RATES_ERROR',
            message: 'Failed to retrieve currency rates'
        });
    }
});

// Convert currency
router.post('/currency-convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;

        if (!amount || !from || !to) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Amount, from currency, and to currency are required'
            });
        }

        const ratesCollection = await getCollection('currency_rates');
        const rates = await ratesCollection.findOne({ 
            base: from.toUpperCase(),
            isActive: true 
        });

        if (!rates || !rates.rates[to.toUpperCase()]) {
            return res.status(400).json({
                success: false,
                error: 'CURRENCY_NOT_SUPPORTED',
                message: 'Currency conversion not supported'
            });
        }

        const convertedAmount = amount * rates.rates[to.toUpperCase()];

        res.json({
            success: true,
            data: {
                originalAmount: amount,
                originalCurrency: from.toUpperCase(),
                convertedAmount: Math.round(convertedAmount * 100) / 100,
                targetCurrency: to.toUpperCase(),
                rate: rates.rates[to.toUpperCase()],
                lastUpdated: rates.updatedAt
            }
        });
    } catch (error) {
        logger.error('Currency conversion error:', error);
        res.status(500).json({
            success: false,
            error: 'CURRENCY_CONVERSION_ERROR',
            message: 'Failed to convert currency'
        });
    }
});

// Get regional settings
router.get('/regional-settings/:region', async (req, res) => {
    try {
        const { region } = req.params;

        if (!region) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REGION',
                message: 'Region parameter is required'
            });
        }

        const regionalCollection = await getCollection('regional_settings');
        const settings = await regionalCollection.findOne({ 
            region: region.toLowerCase(),
            isActive: true 
        });

        if (!settings) {
            // Return default US settings if region not found
            const defaultSettings = {
                region: 'us',
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                timezone: 'America/New_York',
                numberFormat: {
                    decimal: '.',
                    thousands: ',',
                    precision: 2
                },
                phoneFormat: '+1 (XXX) XXX-XXXX',
                addressFormat: {
                    street: true,
                    city: true,
                    state: true,
                    zipCode: true,
                    country: true
                }
            };

            return res.json({
                success: true,
                data: defaultSettings
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        logger.error('Get regional settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REGIONAL_SETTINGS_ERROR',
            message: 'Failed to retrieve regional settings'
        });
    }
});

// ==================== CULTURAL ADAPTATIONS ====================

// Get cultural adaptations
router.get('/cultural-adaptations/:culture', async (req, res) => {
    try {
        const { culture } = req.params;

        if (!culture) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_CULTURE',
                message: 'Culture parameter is required'
            });
        }

        const culturalCollection = await getCollection('cultural_adaptations');
        const adaptations = await culturalCollection.findOne({ 
            culture: culture.toLowerCase(),
            isActive: true 
        });

        if (!adaptations) {
            // Return default Western adaptations if culture not found
            const defaultAdaptations = {
                culture: 'western',
                colorScheme: {
                    primary: '#007AFF',
                    secondary: '#5856D6',
                    success: '#34C759',
                    warning: '#FF9500',
                    error: '#FF3B30'
                },
                icons: {
                    style: 'outlined',
                    size: 'medium'
                },
                layout: {
                    direction: 'ltr',
                    alignment: 'left'
                },
                dateTime: {
                    calendar: 'gregorian',
                    firstDayOfWeek: 0
                }
            };

            return res.json({
                success: true,
                data: defaultAdaptations
            });
        }

        res.json({
            success: true,
            data: adaptations
        });
    } catch (error) {
        logger.error('Get cultural adaptations error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CULTURAL_ADAPTATIONS_ERROR',
            message: 'Failed to retrieve cultural adaptations'
        });
    }
});

// ==================== CONTENT LOCALIZATION ====================

// Get localized content
router.get('/content/:contentType', async (req, res) => {
    try {
        const { contentType } = req.params;
        const { language, region, platform } = req.query;

        if (!contentType) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_CONTENT_TYPE',
                message: 'Content type parameter is required'
            });
        }

        const contentCollection = await getCollection('localized_content');
        
        const filters = { 
            contentType,
            isActive: true 
        };
        if (language) filters.language = language.toLowerCase();
        if (region) filters.region = region.toLowerCase();
        if (platform) filters.platform = platform;

        const content = await contentCollection.find(filters)
            .sort({ priority: -1, updatedAt: -1 })
            .toArray();

        res.json({
            success: true,
            data: {
                contentType,
                language: language || 'en',
                region: region || 'us',
                content: content
            }
        });
    } catch (error) {
        logger.error('Get localized content error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_LOCALIZED_CONTENT_ERROR',
            message: 'Failed to retrieve localized content'
        });
    }
});

// ==================== LANGUAGE DETECTION ====================

// Detect user language
router.post('/detect-language', async (req, res) => {
    try {
        const { text, userAgent, acceptLanguage } = req.body;

        // Simple language detection based on Accept-Language header
        let detectedLanguage = 'en'; // Default to English

        if (acceptLanguage) {
            const languages = acceptLanguage.split(',');
            const primaryLanguage = languages[0].split(';')[0].trim();
            
            // Map common language codes
            const languageMap = {
                'en': 'en',
                'en-US': 'en',
                'en-GB': 'en',
                'es': 'es',
                'es-ES': 'es',
                'es-MX': 'es',
                'fr': 'fr',
                'fr-FR': 'fr',
                'fr-CA': 'fr',
                'de': 'de',
                'de-DE': 'de',
                'it': 'it',
                'it-IT': 'it',
                'pt': 'pt',
                'pt-BR': 'pt',
                'pt-PT': 'pt',
                'ru': 'ru',
                'ru-RU': 'ru',
                'ja': 'ja',
                'ja-JP': 'ja',
                'ko': 'ko',
                'ko-KR': 'ko',
                'zh': 'zh',
                'zh-CN': 'zh',
                'zh-TW': 'zh',
                'ar': 'ar',
                'ar-SA': 'ar',
                'hi': 'hi',
                'hi-IN': 'hi'
            };

            detectedLanguage = languageMap[primaryLanguage] || 'en';
        }

        res.json({
            success: true,
            data: {
                detectedLanguage,
                confidence: 0.85,
                method: 'accept-language-header'
            }
        });
    } catch (error) {
        logger.error('Language detection error:', error);
        res.status(500).json({
            success: false,
            error: 'LANGUAGE_DETECTION_ERROR',
            message: 'Failed to detect language'
        });
    }
});

// ==================== RTL LANGUAGE SUPPORT ====================

// Get RTL language settings
router.get('/rtl-settings/:language', async (req, res) => {
    try {
        const { language } = req.params;

        if (!language) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_LANGUAGE',
                message: 'Language parameter is required'
            });
        }

        // RTL languages
        const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ku', 'yi'];

        const isRTL = rtlLanguages.includes(language.toLowerCase());

        const rtlSettings = {
            language: language.toLowerCase(),
            isRTL,
            textDirection: isRTL ? 'rtl' : 'ltr',
            textAlignment: isRTL ? 'right' : 'left',
            layoutDirection: isRTL ? 'rtl' : 'ltr',
            numberFormat: isRTL ? 'arabic' : 'western',
            dateFormat: isRTL ? 'DD/MM/YYYY' : 'MM/DD/YYYY'
        };

        res.json({
            success: true,
            data: rtlSettings
        });
    } catch (error) {
        logger.error('Get RTL settings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_RTL_SETTINGS_ERROR',
            message: 'Failed to retrieve RTL settings'
        });
    }
});

// ==================== REGIONAL COMPLIANCE ====================

// Get regional compliance requirements
router.get('/compliance/:region', async (req, res) => {
    try {
        const { region } = req.params;

        if (!region) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REGION',
                message: 'Region parameter is required'
            });
        }

        const complianceCollection = await getCollection('regional_compliance');
        const compliance = await complianceCollection.findOne({ 
            region: region.toLowerCase(),
            isActive: true 
        });

        if (!compliance) {
            // Return default US compliance if region not found
            const defaultCompliance = {
                region: 'us',
                dataProtection: 'CCPA',
                privacyPolicy: true,
                termsOfService: true,
                cookieConsent: true,
                ageRestriction: 13,
                currencyDisplay: 'USD',
                taxInclusion: false,
                vatRate: 0
            };

            return res.json({
                success: true,
                data: defaultCompliance
            });
        }

        res.json({
            success: true,
            data: compliance
        });
    } catch (error) {
        logger.error('Get regional compliance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REGIONAL_COMPLIANCE_ERROR',
            message: 'Failed to retrieve regional compliance'
        });
    }
});

module.exports = router;
